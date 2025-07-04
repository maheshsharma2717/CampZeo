﻿using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Post;
using MC.Basic.Domains;
using MC.Basic.Domains.Entities;
using MC.Basic.Persistance;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using static System.Net.WebRequestMethods;

namespace MC.Basic.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class SocialMediaController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly BasicDbContext _context;
        private readonly IPlatformConfigurationRepository _platformConfigurationRepository;
        private readonly IUserRepository _userRepository;
        public SocialMediaController(IHttpClientFactory httpClientFactory, BasicDbContext context, IPlatformConfigurationRepository platformConfigurationRepository, IUserRepository userRepository)
        {
            _httpClient = httpClientFactory.CreateClient();
            _context = context;
            _platformConfigurationRepository = platformConfigurationRepository;
            _userRepository = userRepository;
        }

        [HttpPost("exchange-token")]
        public async Task<IActionResult> ExchangeToken([FromBody] ExchangeTokenRequest request)
        {
            switch(request.Platform.ToLower())
            {
                case "instagram":
                {
                    var InstaAppId = await _platformConfigurationRepository.GetConfigurationValueByKey("AppId", PlatformType.Instagram);
                    var InstaAppSecret = await _platformConfigurationRepository.GetConfigurationValueByKey("AppSecret", PlatformType.Instagram);

                    var requestUri = $"https://graph.facebook.com/v19.0/oauth/access_token";
                    var formData = new Dictionary<string, string>
                {
                 { "client_id", InstaAppId },
                 { "client_secret", InstaAppSecret },
                 { "redirect_uri", "http://localhost:4200/auth-callback" },
                 { "code", request.Code }
                };

                    var requestMessage = new HttpRequestMessage(HttpMethod.Post, requestUri)
                    {
                        Content = new FormUrlEncodedContent(formData)
                    };

                    var tokenResponse = await _httpClient.SendAsync(requestMessage);
                    var content = await tokenResponse.Content.ReadAsStringAsync();

                    if(!tokenResponse.IsSuccessStatusCode)
                    {
                        return BadRequest(new
                        {
                            error = "Instagram token exchange failed",
                            response = content
                        });
                    }

                    var igToken = JsonConvert.DeserializeObject<InstagramTokenResponse>(content);
                    if(igToken != null)
                    {
                        var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                        if(user == null) return NotFound("User not found");

                        user.InstagramAccessToken = igToken.AccessToken;
                        user.InstagramTokenCreatedAt = DateTime.UtcNow;

                        if(igToken.ExpiresIn > 0)
                        {
                            user.InstagramTokenExpiresIn = igToken.ExpiresIn;
                        }
                        await _context.SaveChangesAsync();
                        return Ok(igToken);
                    }
                    return BadRequest("Could not parse Instagram token");
                }
                case "facebook":
                {
                    var appId = await _platformConfigurationRepository.GetConfigurationValueByKey("AppId", PlatformType.Facebook);
                    var AppSecret = await _platformConfigurationRepository.GetConfigurationValueByKey("AppSecret", PlatformType.Facebook);

                    var fbResponse = await _httpClient.GetAsync(
                    $"https://graph.facebook.com/v19.0/oauth/access_token?client_id={appId}&redirect_uri={"http://localhost:4200/auth-callback"}&client_secret={AppSecret}&code={request.Code}"
                    );

                    var fbContent = await fbResponse.Content.ReadAsStringAsync();
                    var token = JsonConvert.DeserializeObject<FacebookTokenResponse>(fbContent);

                    if(token != null)
                    {
                        var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                        if(user == null) return NotFound("User not found");

                        user.FacebookAccessToken = token.AccessToken;
                        user.FacebookTokenType = token.TokenType;
                        user.FacebookTokenCreatedAt = DateTime.UtcNow;
                        user.FacebookTokenExpiresIn = token.ExpiresIn.HasValue ? token.ExpiresIn.Value : 5184000;
                        await _context.SaveChangesAsync();
                    }
                    return Ok(token);
                }
                case "linkedin":
                {
                    var clientId = await _platformConfigurationRepository.GetConfigurationValueByKey("ClientId", PlatformType.LinkedIn);
                    var clientSecret = await _platformConfigurationRepository.GetConfigurationValueByKey("CLientSecret", PlatformType.LinkedIn);

                    // Step 1: Exchange code for access token
                    var tokenRequest = new Dictionary<string, string>
    {
        { "grant_type", "authorization_code" },
        { "code", request.Code },
        { "redirect_uri", "http://localhost:4200/auth-callback" },
        { "client_id", clientId },
        { "client_secret", clientSecret }
    };

                    using var httpClient = new HttpClient();
                    var tokenResponse = await httpClient.PostAsync(
                        "https://www.linkedin.com/oauth/v2/accessToken",
                        new FormUrlEncodedContent(tokenRequest));

                    if(!tokenResponse.IsSuccessStatusCode)
                        return StatusCode((int)tokenResponse.StatusCode, await tokenResponse.Content.ReadAsStringAsync());

                    var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
                    var token = JsonConvert.DeserializeObject<LinkedInTokenResponse>(tokenJson);

                    // Step 2: Get user profile (for author URN)
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
                    var profileResponse = await httpClient.GetAsync("https://api.linkedin.com/v2/userinfo");

                    if(!profileResponse.IsSuccessStatusCode)
                        return StatusCode((int)profileResponse.StatusCode, await profileResponse.Content.ReadAsStringAsync());

                    var profileJson = await profileResponse.Content.ReadAsStringAsync();
                    dynamic profile = JsonConvert.DeserializeObject(profileJson);
                    string authorUrn = $"urn:li:person:{profile.sub}";
                    if(token != null)
                    {
                        var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                        if(user == null) return NotFound("User not found");

                        user.LinkedInAccessToken = token.AccessToken;
                        user.LinkedInAuthUrn = authorUrn;
                        await _context.SaveChangesAsync();
                    }
                    // Step 3: Return token + authorUrn
                    return Ok(token);
                }
                default:
                return BadRequest("Invalid platform specified.");
            }


        }


        [HttpGet("pages")]
        public async Task<IActionResult> GetUserPages([FromQuery] string accessToken)
        {
            var response = await _httpClient.GetAsync($"https://graph.facebook.com/v19.0/me/accounts?access_token={accessToken}");
            var content = await response.Content.ReadAsStringAsync();

            return Content(content, "application/json");
        }


        [HttpPost("post-facebook")]
        public async Task<IActionResult> PostToFacebook([FromBody] PostData post)
        {
            var attachments = new List<string>();

            foreach(var imageBase64 in post.Images)
            {
                var base64Data = imageBase64.Split(',')[1];
                var imageBytes = Convert.FromBase64String(base64Data);
                var byteContent = new ByteArrayContent(imageBytes);
                byteContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

                var uploadImageUrl = $"https://graph.facebook.com/v19.0/{post.PageId}/photos";

                var content = new MultipartFormDataContent
        {
            { new StringContent(post.PageAccessToken), "access_token" },
            { new StringContent("false"), "published" },
            { byteContent, "source", "image.jpg" }
        };

                var uploadResponse = await _httpClient.PostAsync(uploadImageUrl, content);
                var uploadContent = await uploadResponse.Content.ReadAsStringAsync();

                if(!uploadResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Image upload failed: {uploadContent}");
                }

                var mediaId = JObject.Parse(uploadContent)["id"]?.ToString();
                if(mediaId != null)
                {
                    attachments.Add($"{{\"media_fbid\":\"{mediaId}\"}}");
                }
            }

            foreach(var videoBase64 in post.Videos)
            {
                var base64Data = videoBase64.Split(',')[1];
                var videoBytes = Convert.FromBase64String(base64Data);
                var byteContent = new ByteArrayContent(videoBytes);
                byteContent.Headers.ContentType = new MediaTypeHeaderValue("video/mp4");
                var uploadVideoUrl = $"https://graph.facebook.com/v19.0/{post.PageId}/videos";
                var content = new MultipartFormDataContent
            {
            { new StringContent(post.PageAccessToken), "access_token" },
            { new StringContent("false"), "published" },
            { byteContent, "source", "video.mp4" }
            };

                var uploadResponse = await _httpClient.PostAsync(uploadVideoUrl, content);
                var uploadContent = await uploadResponse.Content.ReadAsStringAsync();

                if(!uploadResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Video upload failed: {uploadContent}");
                }

                var mediaId = JObject.Parse(uploadContent)["id"]?.ToString();
                if(mediaId != null)
                {
                    attachments.Add($"{{\"media_fbid\":\"{mediaId}\"}}");
                }
            }

            var postUrl = $"https://graph.facebook.com/v19.0/{post.PageId}/feed";
            var postData = new Dictionary<string, string>
        {
        { "access_token", post.PageAccessToken },
        { "message", post.Message }
        };

            if(attachments.Any())
            {
                postData["attached_media"] = "[" + string.Join(",", attachments) + "]";
            }

            var json = JsonConvert.SerializeObject(postData);
            var stringContent = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(postUrl, stringContent);

            var result = await response.Content.ReadAsStringAsync();

            if(!response.IsSuccessStatusCode)
            {
                return BadRequest($"Post failed: {result}");
            }
            var postResult = JObject.Parse(result);
            var createdPostId = postResult["id"]?.ToString();
            //var createdPostIds = uploadContent;

            var mediaUrls = new List<string>();
            mediaUrls.AddRange(post.Images);
            mediaUrls.AddRange(post.Videos);

            var newPost = new PostTransaction
            {
                Platform = "Facebook",
                PostId = createdPostId,
                AccountId = post.PageId,
                Message = post.Message,
                MediaUrls = JsonConvert.SerializeObject(mediaUrls),
                PostType = mediaUrls.Any(v => v.EndsWith(".mp4")) ? "video" :
                           mediaUrls.Any() ? "image" : "text",
                CreatedAt = DateTime.UtcNow,
                AccessToken = post.PageAccessToken,
                IsScheduled = false,
                Published = true,
                PublishedAt = DateTime.UtcNow
            };

            _context.PostTransactions.Add(newPost);
            await _context.SaveChangesAsync();

            return Ok(JsonConvert.DeserializeObject(result));
        }

        [HttpGet("user-social-media-tokens/{userId}")]
        public async Task<IActionResult> GetUserFacebookToken(int userId)
        {
            var user = _context.Users.Where(x => x.Id == userId).FirstOrDefault();
            if(user == null)
            {
                return NotFound("Token not available");
            }
            return Ok(new
            {
                linkedInClientId = await _platformConfigurationRepository.GetConfigurationValueByKey("ClientId", PlatformType.LinkedIn),
                linkedInAccessToken = user.LinkedInAccessToken,
                accessToken = user.FacebookAccessToken,
                tokenType = user.FacebookTokenType,
                expiresIn = user.FacebookTokenExpiresIn,
                //expiresAt = user.FacebookTokenCreatedAt.Value.AddSeconds(user.FacebookTokenExpiresIn.Value)
            });
        }

        [HttpGet("instagram-business-account")]
        public async Task<IActionResult> GetInstagramBusinessAccount([FromQuery] string pageId, [FromQuery] string accessToken)
        {
            var url = $"https://graph.facebook.com/v19.0/{pageId}?fields=instagram_business_account&access_token={accessToken}";
            var response = await _httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if(!response.IsSuccessStatusCode)
            {
                return BadRequest(new { error = "Failed to get Instagram Business Account", response = content });
            }
            var data = JsonConvert.DeserializeObject<dynamic>(content);
            string igUserId = data.instagram_business_account?.id;

            if(string.IsNullOrEmpty(igUserId))
                return NotFound("Instagram Business Account not connected to this page.");
            return Ok(new { instagramUserId = igUserId });
        }


        [HttpPost("post-instagram")]
        public async Task<IActionResult> PostToInstagram([FromBody] InstagramPostRequest post)
        {
            string mediaId = null;

            if(!string.IsNullOrEmpty(post.ImageUrl))
            {
                var createMediaUrl = $"https://graph.facebook.com/v21.0/{post.InstagramUserId}/media";
                var mediaParams = new Dictionary<string, string>
             {
            { "image_url", post.ImageUrl },
            { "caption", post.Caption ?? "" },
            { "access_token", post.AccessToken }
             };

                var response = await _httpClient.PostAsync(createMediaUrl, new FormUrlEncodedContent(mediaParams));
                var result = await response.Content.ReadAsStringAsync();

                if(!response.IsSuccessStatusCode)
                    return BadRequest(new { error = "Image upload failed", response = result });

                mediaId = JObject.Parse(result)["id"]?.ToString();
            }
            else if(post.Videos?.Any() == true)
            {
                var videoUrl = post.Videos[0];

                var createMediaUrl = $"https://graph.facebook.com/v21.0/{post.InstagramUserId}/media";
                var mediaParams = new Dictionary<string, string>
            {
            { "media_type", "REELS" },
            { "video_url", "https://drive.google.com/uc?export=download&id=1w4DkdCLGJJpxNR20HHNyRbnwfk4BIyrK" }, 
            //{ "video_url", videoUrl },
            { "caption", post.Caption ?? "" },
            { "access_token", post.AccessToken }
            };

                var response = await _httpClient.PostAsync(createMediaUrl, new FormUrlEncodedContent(mediaParams));
                var result = await response.Content.ReadAsStringAsync();

                if(!response.IsSuccessStatusCode)
                    return BadRequest(new { error = "Video upload failed", response = result });

                mediaId = JObject.Parse(result)["id"]?.ToString();
            }

            if(string.IsNullOrEmpty(mediaId))
                return BadRequest("Media creation failed.");

            string mediaStatus = null;
            int attempts = 0;
            const int maxAttempts = 5;
            const int delayBetweenAttempts = 5000;
            while(attempts < maxAttempts)
            {
                var checkMediaUrl = $"https://graph.facebook.com/v21.0/{mediaId}?fields=status_code&access_token={post.AccessToken}";
                var checkResponse = await _httpClient.GetAsync(checkMediaUrl);
                var checkResult = await checkResponse.Content.ReadAsStringAsync();
                mediaStatus = JObject.Parse(checkResult)["status_code"]?.ToString();

                if(mediaStatus == "FINISHED")
                {
                    break;
                }

                attempts++;
                if(attempts < maxAttempts)
                {
                    await Task.Delay(delayBetweenAttempts);
                }
            }

            if(mediaStatus != "FINISHED")
            {
                return BadRequest("Media is still being processed, please try again later.");
            }

            var publishUrl = $"https://graph.facebook.com/v21.0/{post.InstagramUserId}/media_publish";
            var publishPayload = new Dictionary<string, string>
    {
        { "creation_id", mediaId },
        { "access_token", post.AccessToken }
    };

            var publishResponse = await _httpClient.PostAsync(publishUrl, new FormUrlEncodedContent(publishPayload));
            var publishContent = await publishResponse.Content.ReadAsStringAsync();

            if(!publishResponse.IsSuccessStatusCode)
                return BadRequest(new { error = "Publish failed", response = publishContent });
            var publishResult = JObject.Parse(publishContent);
            var createdPostId = publishResult["id"]?.ToString();

            var mediaUrls = new List<string>();
            if(!string.IsNullOrEmpty(post.ImageUrl))
                mediaUrls.Add(post.ImageUrl);
            if(post.Videos != null)
                mediaUrls.AddRange(post.Videos);

            var newPost = new PostTransaction
            {
                Platform = "Instagram",
                PostId = createdPostId,
                AccountId = post.InstagramUserId,
                Message = post.Caption,
                MediaUrls = JsonConvert.SerializeObject(mediaUrls),
                PostType = mediaUrls.Any(v => v.EndsWith(".mp4")) ? "video" :
                           mediaUrls.Any() ? "image" : "text",
                CreatedAt = DateTime.UtcNow,
                AccessToken = post.AccessToken,
                IsScheduled = false,
                Published = true,
                PublishedAt = DateTime.UtcNow
            };

            _context.PostTransactions.Add(newPost);
            await _context.SaveChangesAsync();

            return Ok(JsonConvert.DeserializeObject(publishContent));
        }

        [HttpPost("upload-media-file")]
        public async Task<IActionResult> UploadMediaFile([FromBody] MediaUploadRequest request)
        {
            try
            {
                var base64 = request.Base64;
                var extension = base64.Contains("image") ? "jpg" : "mp4";
                var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                if(!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                var fileName = $"{Guid.NewGuid()}.{extension}";
                var filePath = Path.Combine(folder, fileName);

                var base64Data = base64.Substring(base64.IndexOf(",") + 1);
                var fileBytes = Convert.FromBase64String(base64Data);
                await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);

                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                return Ok(new { fileUrl });
            }
            catch(Exception ex)
            {
                return BadRequest(new { error = "Failed to upload media", detail = ex.Message });
            }
        }


        [RequestSizeLimit(104_857_600)]
        [HttpPost("upload-video-file")]
        public async Task<IActionResult> UploadVideoFile([FromForm] VideoUploadDto dto)
        {
            var file = dto.File;

            if(file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            try
            {
                var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if(!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadFolder, fileName);

                using(var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

                return Ok(new { url = fileUrl });
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "Upload failed.", error = ex.Message });
            }
        }

        [HttpGet("get-post-insights")]
        public async Task<IActionResult> GetPostInsights(string postId, string accessToken, string platform)
        {
            if(platform.ToLower() == "facebook")
            {
                var insightsUrl = $"https://graph.facebook.com/v21.0/{postId}/insights?metric=post_impressions,post_engaged_users,post_reactions_like_total,post_reactions_love_total&access_token={accessToken}";
                //var insightsUrl = $"https://graph.facebook.com/v21.0/{postId}/insights?metric=post_impressions,post_engaged_users,post_clicks,post_reactions_by_type_total&access_token={accessToken}";
                var summaryUrl = $"https://graph.facebook.com/v21.0/{postId}?fields=shares,comments.summary(true),reactions.summary(true)&access_token={accessToken}";

                var insightsResponse = await _httpClient.GetAsync(insightsUrl);
                var insightsContent = await insightsResponse.Content.ReadAsStringAsync();

                var summaryResponse = await _httpClient.GetAsync(summaryUrl);
                var summaryContent = await summaryResponse.Content.ReadAsStringAsync();

                if(!insightsResponse.IsSuccessStatusCode || !summaryResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new
                    {
                        error = "Failed to fetch Facebook insights",
                        insights = insightsContent,
                        summary = summaryContent
                    });
                }

                return Ok(new
                {
                    insights = JsonConvert.DeserializeObject(insightsContent),
                    summary = JsonConvert.DeserializeObject(summaryContent)
                });
            }
            else if(platform.ToLower() == "instagram")
            {
                var url = $"https://graph.facebook.com/v21.0/{postId}/insights?metric=impressions,reach,engagement,saved,video_views&access_token={accessToken}";
                var response = await _httpClient.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();

                if(!response.IsSuccessStatusCode)
                    return BadRequest(new { error = "Failed to fetch Instagram insights", response = content });

                return Ok(JsonConvert.DeserializeObject(content));
            }

            return BadRequest("Invalid platform specified.");
        }

        [HttpGet("get-all-posts")]
        public async Task<IActionResult> GetAllPosts()
        {
            var posts = await _context.PostTransactions.ToListAsync();
            return Ok(posts);
        }
        [HttpPost("post-linkedin")]
        public async Task<IActionResult> PostToLinkedIn(ApiRequest<LinkedInPostRequest> apiReq)
        {
            try
            {
                var user =await _userRepository.GetAsync(x => x.Token == apiReq.Token);
                // Step 1: Register the upload (if it's an image or video)
                var post = apiReq.Data;
                if(user == null || string.IsNullOrEmpty(user.LinkedInAccessToken))
                    return BadRequest("User not found or LinkedIn access token is missing.");
                string uploadedMediaUrn = null;
                if(!string.IsNullOrEmpty(post.ImageUrl))
                {
                    var registerUploadUrl = "https://api.linkedin.com/v2/assets?action=registerUpload";
                    var registerPayload = new
                    {
                        registerUploadRequest = new
                        {
                            owner = user.LinkedInAuthUrn,
                            recipes = new[] { "urn:li:digitalmediaRecipe:feedshare-image" },
                            serviceRelationships = new[]
                            {
                        new {
                            identifier = "urn:li:userGeneratedContent",
                            relationshipType = "OWNER"
                        }
                    }
                        }
                    };
                    _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", user.LinkedInAccessToken);

                    var registerResponse = await _httpClient.PostAsJsonAsync(registerUploadUrl, registerPayload, new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
                    });

                    var registerResult = await registerResponse.Content.ReadAsStringAsync();
                    if(!registerResponse.IsSuccessStatusCode)
                        return BadRequest(new { error = "Register upload failed", response = registerResult });

                    var registerObj = JObject.Parse(registerResult);
                    var uploadUrl = registerObj["value"]?["uploadMechanism"]?["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?["uploadUrl"]?.ToString();
                    uploadedMediaUrn = registerObj["value"]?["asset"]?.ToString();

                    if(!string.IsNullOrEmpty(uploadUrl))
                    {
                        using var imageResponse = await _httpClient.PutAsync(uploadUrl, new StreamContent(await _httpClient.GetStreamAsync(post.ImageUrl)));
                        if(!imageResponse.IsSuccessStatusCode)
                            return BadRequest("Image upload to LinkedIn failed.");
                    }
                }

                // Step 2: Post the UGC post
                var postUrl = "https://api.linkedin.com/v2/ugcPosts";
                var postBody = new Dictionary<string, object>
                {
                    ["author"] =user.LinkedInAuthUrn,
                    ["lifecycleState"] = "PUBLISHED",
                    ["specificContent"] = new Dictionary<string, object>
                    {
                        ["com.linkedin.ugc.ShareContent"] = new Dictionary<string, object>
                        {
                            ["shareCommentary"] = new Dictionary<string, object>
                            {
                                ["text"] = post.Caption ?? ""
                            },
                            ["shareMediaCategory"] = string.IsNullOrEmpty(uploadedMediaUrn) ? "NONE" : "IMAGE",
                            ["media"] = string.IsNullOrEmpty(uploadedMediaUrn) ? null : new[]
              {
                new Dictionary<string, object>
                {
                    ["status"] = "READY",
                    ["description"] = new { text = post.Caption ?? "" },
                    ["media"] = uploadedMediaUrn,
                    ["title"] = new { text = "Post Image" }
                }
            }
                        }
                    },
                    ["visibility"] = new Dictionary<string, object>
                    {
                        ["com.linkedin.ugc.MemberNetworkVisibility"] = "PUBLIC"
                    }
                };

                var request = new HttpRequestMessage(HttpMethod.Post, postUrl)
                {
                    Content = new StringContent(JsonConvert.SerializeObject(postBody), Encoding.UTF8, "application/json")
                };
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", user.LinkedInAccessToken);

                var publishResponse = await _httpClient.SendAsync(request);
                var publishResult = await publishResponse.Content.ReadAsStringAsync();

                    if(!publishResponse.IsSuccessStatusCode)
                    return BadRequest(new { error = "Post publish failed", response = publishResult });

                // Save Post to DB
                var newPost = new PostTransaction
                {
                    Platform = "LinkedIn",
                    PostId = JObject.Parse(publishResult)["id"]?.ToString(),
                    AccountId = user.LinkedInAuthUrn,
                    Message = post.Caption,
                    MediaUrls = JsonConvert.SerializeObject(string.IsNullOrEmpty(post.ImageUrl) ? new List<string>() : new List<string> { post.ImageUrl }),
                    PostType = string.IsNullOrEmpty(post.ImageUrl) ? "text" : "image",
                    CreatedAt = DateTime.UtcNow,
                    AccessToken = user.LinkedInAccessToken,
                    IsScheduled = false,
                    Published = true,
                    PublishedAt = DateTime.UtcNow
                };

                _context.PostTransactions.Add(newPost);
                await _context.SaveChangesAsync();

                return Ok(JsonConvert.DeserializeObject(publishResult));
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

    }
}
