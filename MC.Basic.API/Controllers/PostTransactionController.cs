using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Post;
using MC.Basic.Domains;
using MC.Basic.Domains.Entities;
using MC.Basic.Persistance;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using static System.Net.WebRequestMethods;
using Google.Apis.Auth.OAuth2;
using Google.Apis.YouTube.v3;
using Google.Apis.YouTube.v3.Data;
using Google.Apis.Services;
using Google.Apis.Upload;
using System.Net;
using System.Text.Json.Nodes;

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
            switch (request.Platform.ToLower())
            {
                case "instagram":
                    {
                        try
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

                            if (!tokenResponse.IsSuccessStatusCode)
                            {
                                return BadRequest(new
                                {
                                    error = "Instagram token exchange failed",
                                    statusCode = tokenResponse.StatusCode,
                                    response = content
                                });
                            }

                            var igToken = JsonConvert.DeserializeObject<InstagramTokenResponse>(content);
                            if (igToken != null)
                            {
                                var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                                if (user == null) return NotFound("User not found");

                                user.InstagramAccessToken = igToken.AccessToken;
                                user.InstagramTokenCreatedAt = DateTime.UtcNow;

                                if (igToken.ExpiresIn > 0)
                                {
                                    user.InstagramTokenExpiresIn = igToken.ExpiresIn;
                                }

                                await _context.SaveChangesAsync();
                                return Ok(igToken);
                            }

                            return BadRequest("Could not parse Instagram token");
                        }
                        catch (HttpRequestException httpEx)
                        {
                            return BadRequest(new
                            {
                                error = "HTTP request to Instagram failed",
                                message = httpEx.Message
                            });
                        }
                        catch (JsonException jsonEx)
                        {
                            return BadRequest(new
                            {
                                error = "Failed to parse Instagram token response",
                                message = jsonEx.Message
                            });
                        }
                        catch (Exception ex)
                        {
                            return StatusCode(500, new
                            {
                                error = "Unexpected server error",
                                message = ex.Message
                            });
                        }
                    }

                case "facebook":
                    {
                        try
                        {
                            var appId = await _platformConfigurationRepository.GetConfigurationValueByKey("AppId", PlatformType.Facebook);
                            var AppSecret = await _platformConfigurationRepository.GetConfigurationValueByKey("AppSecret", PlatformType.Facebook);

                            var fbResponse = await _httpClient.GetAsync(
                            $"https://graph.facebook.com/v19.0/oauth/access_token?fields=id,name,email&client_id={appId}&redirect_uri={"http://localhost:4200/auth-callback"}&client_secret={AppSecret}&code={request.Code}"
                            );

                            var fbContent = await fbResponse.Content.ReadAsStringAsync();
                            var token = JsonConvert.DeserializeObject<FacebookTokenResponse>(fbContent);


                            var fbUrl = $"https://graph.facebook.com/me?fields=id,name,email&access_token={token?.AccessToken}";
                            var fbUserResponse = await _httpClient.GetAsync(fbUrl);
                            if (!fbUserResponse.IsSuccessStatusCode)
                                return StatusCode((int)fbUserResponse.StatusCode, await fbUserResponse.Content.ReadAsStringAsync());
                            var Content = await fbUserResponse.Content.ReadAsStringAsync();
                            var fbUserContent = JsonConvert.DeserializeObject<FacebookUserDto>(Content);
                            FacebookUserDto fbUser = new FacebookUserDto();
                            fbUser.Id = fbUserContent?.Id;
                            fbUser.Name = fbUserContent?.Name;


                            var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                            if (token != null)
                            {
                                if (user == null) return NotFound("User not found");

                                user.FacebookAccessToken = token.AccessToken;
                                user.FacebookTokenType = token.TokenType;
                                user.FacebookTokenCreatedAt = DateTime.UtcNow;
                                user.FacebookTokenExpiresIn = token.ExpiresIn.HasValue ? token.ExpiresIn.Value : 5184000;
                                await _context.SaveChangesAsync();
                            }

                            return Ok(new
                            {
                                AccessToken = token.AccessToken,
                                User = fbUser
                            });
                        }
                        catch (Exception ex)
                        {
                            throw new Exception("Error exchanging Facebook token", ex);
                        }
                    }
                case "youtube":
                    {
                        var AppId = await _platformConfigurationRepository.GetConfigurationValueByKey("ClientId", PlatformType.Youtube);
                        var AppSecret = await _platformConfigurationRepository.GetConfigurationValueByKey("ClientSecret", PlatformType.Youtube);

                        if (string.IsNullOrEmpty(request.Code))
                        {
                            return BadRequest("Token is missing");
                        }
                        using var httpClient = new HttpClient();
                        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", request.Code);
                        var response = await httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={request.Code}&redirect_uri={"http://localhost:4200/auth-callback"}&client_secret={AppSecret}");

                        var content = await response.Content.ReadAsStringAsync();
                        var YoutubeChannelData = JsonConvert.DeserializeObject<YoutubeUserDto>(content);

                        YoutubeUserDto youtubeUser = new YoutubeUserDto();
                        youtubeUser.sub = YoutubeChannelData?.sub;
                        youtubeUser.Name = YoutubeChannelData?.Name;
                        youtubeUser.email = YoutubeChannelData?.email;
                        var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                        if (user == null) return NotFound("User not found");
                        user.YoutubeAccessToken = request.Code;
                        user.YoutubeAuthUrn = youtubeUser.sub;
                        await _context.SaveChangesAsync();
                        return Ok(new
                        {
                            AccessToken = request.Code,
                            User = youtubeUser
                        });
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

                        if (!tokenResponse.IsSuccessStatusCode)
                            return StatusCode((int)tokenResponse.StatusCode, await tokenResponse.Content.ReadAsStringAsync());

                        var tokenJson = await tokenResponse.Content.ReadAsStringAsync();
                        var token = JsonConvert.DeserializeObject<LinkedInTokenResponse>(tokenJson);

                        // Step 2: Get user profile (for author URN)
                        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
                        var profileResponse = await httpClient.GetAsync("https://api.linkedin.com/v2/userinfo");

                        if (!profileResponse.IsSuccessStatusCode)
                            return StatusCode((int)profileResponse.StatusCode, await profileResponse.Content.ReadAsStringAsync());

                        var profileJson = await profileResponse.Content.ReadAsStringAsync();
                        dynamic profile = JsonConvert.DeserializeObject(profileJson);
                        string authorUrn = $"urn:li:person:{profile.sub}";
                        if (token != null)
                        {
                            var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                            if (user == null) return NotFound("User not found");

                            user.LinkedInAccessToken = token.AccessToken;
                            user.LinkedInAuthUrn = authorUrn;
                            await _context.SaveChangesAsync();
                        }
                        // Step 3: Return token + authorUrn
                        return Ok(token);
                    }
                case "pinterest":
                    {
                        var AppId = await _platformConfigurationRepository.GetConfigurationValueByKey("AppId", PlatformType.Pinterest);
                        var AppSecret = await _platformConfigurationRepository.GetConfigurationValueByKey("ClientSecret", PlatformType.Pinterest);

                        if (string.IsNullOrEmpty(request.Code))
                        {
                            return BadRequest("Invalid token");
                        }

                        var values = new Dictionary<string, string>
    {
        { "grant_type", "authorization_code" },
        { "code", request.Code },
        { "redirect_uri", "http://localhost:4200/auth-callback" }
    };

                        using var httpClient = new HttpClient();
                        var content = new FormUrlEncodedContent(values);
                        content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");
                        var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{AppId}:{AppSecret}"));
                        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);
                        httpClient.DefaultRequestHeaders.Accept.Clear();
                        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                        var response = await httpClient.PostAsync("https://api.pinterest.com/v5/oauth/token", content);
                        if (!response.IsSuccessStatusCode)
                        {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            return BadRequest(new { error = "Failed to exchange Pinterest token", response = errorContent });
                        }
                        var jsonResult = await response.Content.ReadAsStringAsync();
                        var result = JsonConvert.DeserializeObject<PinterestTokenResponse>(jsonResult);

                        var accountRequest = new HttpRequestMessage(HttpMethod.Get, "https://api.pinterest.com/v5/user_account");
                        accountRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", result.access_token);
                        var accountResponse = await _httpClient.SendAsync(accountRequest);
                        if (!accountResponse.IsSuccessStatusCode)
                        {
                            var errorContent = await response.Content.ReadAsStringAsync();
                            return BadRequest(new { error = "Unable to fetch Pinterest account", response = errorContent });
                        }
                        var accountContent = await accountResponse.Content.ReadAsStringAsync();
                        var data = JsonConvert.DeserializeObject<PinterestProfile>(accountContent);
                        if (data == null)
                            return NotFound("Data not found");
                        var pinterestProfile = new
                        {
                            Id = data.Id,
                            Username = data.Username,
                            BusinessName = data.Business_Name,
                            FollowerCount = data.FollowerCount,
                            FollowingCount = data.FollowingCount,
                            ProfileImageUrl = data.Profile_Image
                        };

                        var profile = new
                        {
                            pinterestProfile = pinterestProfile,
                            accessToken = result.access_token,
                        };

                        var user = _context.Users.FirstOrDefault(x => x.Id == request.UserId);
                        if (user == null) return NotFound("User not found");
                        user.PinterestAccessToken = result.access_token;
                        user.PinterestAuthUrn = data.Id;

                        await _context.SaveChangesAsync();

                        return Ok(profile);
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

            // Directly use image URLs (no base64 conversion)
            foreach (var imageUrl in post.Images)
            {
                // Download the image from the URL
                using var imageResponse = await _httpClient.GetAsync(imageUrl);
                if (!imageResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Failed to download image from URL: {imageUrl}");
                }
                var imageBytes = await imageResponse.Content.ReadAsByteArrayAsync();
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

                if (!uploadResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Image upload failed: {uploadContent}");
                }

                var mediaId = JObject.Parse(uploadContent)["id"]?.ToString();
                if (mediaId != null)
                {
                    attachments.Add($"{{\"media_fbid\":\"{mediaId}\"}}");
                }
            }

            // Directly use video URLs (no base64 conversion)
            foreach (var videoUrl in post.Videos)
            {
                // Download the video from the URL
                using var videoResponse = await _httpClient.GetAsync(videoUrl);
                if (!videoResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Failed to download video from URL: {videoUrl}");
                }
                var videoBytes = await videoResponse.Content.ReadAsByteArrayAsync();
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

                if (!uploadResponse.IsSuccessStatusCode)
                {
                    return BadRequest($"Video upload failed: {uploadContent}");
                }

                var mediaId = JObject.Parse(uploadContent)["id"]?.ToString();
                if (mediaId != null)
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

            if (attachments.Any())
            {
                postData["attached_media"] = "[" + string.Join(",", attachments) + "]";
            }

            var json = JsonConvert.SerializeObject(postData);
            var stringContent = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(postUrl, stringContent);

            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest($"Post failed: {result}");
            }
            var postResult = JObject.Parse(result);
            var createdPostId = postResult["id"]?.ToString();

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
            if (user == null)
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

        [HttpGet("youtube-channel")]
        public async Task<IActionResult> GetYouTubeChannel([FromQuery] string accessToken)
        {
            if (string.IsNullOrEmpty(accessToken))
            {
                return BadRequest("Access token is required.");
            }
            var url = $"https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token={accessToken}";
            var response = await _httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new { error = "Failed to get YouTube channel", response = content });
            }
            var data = JsonConvert.DeserializeObject<dynamic>(content);
            if (data.items == null || data.items.Count == 0)
            {
                return NotFound("No YouTube channel found for the provided access token.");
            }
            var channelId = data.items[0].id.ToString();
            var channelTitle = data.items[0].snippet.title.ToString();
            return Ok(new { channelId, channelTitle });
        }

        [HttpPost("upload-youtube")]
        public async Task<IActionResult> UploadYouTubeVideo([FromBody] YouTubeUploadRequest request)
        {
            if (string.IsNullOrEmpty(request.AccessToken))
                return BadRequest("Access token required");
            if (string.IsNullOrEmpty(request.VideoUrl))
                return BadRequest("No video data.");

            var videoUrl = request.VideoUrl;
            var filename = Path.GetFileName(new Uri(videoUrl).AbsolutePath);
            var fullFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", filename);
            if (!System.IO.File.Exists(fullFilePath))
            {
                return NotFound("Video file not found.");
            }

            var credential = GoogleCredential.FromAccessToken(request.AccessToken)
                .CreateScoped(YouTubeService.Scope.YoutubeUpload);
            var YoutubeService = new YouTubeService(new BaseClientService.Initializer
            {
                HttpClientInitializer = credential,
                ApplicationName = "CampZeo",
            });
            var videoDescription = WebUtility.HtmlDecode(request.Description);
            videoDescription = Regex.Replace(videoDescription, "<.*?>", string.Empty);
            var video = new Video
            {
                Snippet = new VideoSnippet
                {
                    Title = request.Title,
                    Description = videoDescription,
                    Tags = request.Tags,
                    CategoryId = request.CategoryId
                },
                Status = new VideoStatus
                {
                    PrivacyStatus = request.PrivacyStatus
                }
            };


            using (var videoStream = new FileStream(fullFilePath, FileMode.Open, FileAccess.Read))
            {
                var videoInsertRequest = YoutubeService.Videos.Insert(video, "snippet,status", videoStream, "video/*");
                var uploadProgress = await videoInsertRequest.UploadAsync();
                Console.WriteLine($"Upload Status: {uploadProgress.Status}");
                if (uploadProgress.Exception != null)
                    Console.WriteLine($"Upload Exception: {uploadProgress.Exception.Message}");
                if (videoInsertRequest.ResponseBody != null)
                {
                    var videoId = videoInsertRequest.ResponseBody.Id;
                    var channelData = GetYouTubeChannel(request.AccessToken);
                    var MediaUrls = new List<string>();
                    MediaUrls.AddRange(request.Videos);

                    var newYoutubePost = new PostTransaction
                    {
                        Platform = "Youtube",
                        PostId = videoId,
                        Message = request.Description,
                        CreatedAt = DateTime.UtcNow,
                        MediaUrls = JsonConvert.SerializeObject(MediaUrls),
                        AccessToken = request.AccessToken,
                        IsScheduled = false,
                        Published = true,
                        PublishedAt = DateTime.UtcNow
                    };
                    _context.PostTransactions.Add(newYoutubePost);
                    await _context.SaveChangesAsync();
                    return Ok(new
                    {
                        VideoId = videoId,
                        VideoUrl = $"https://www.youtube.com/watch?v={videoId}"
                    });
                }
                else
                {
                    return BadRequest("Video upload failed.");
                }
            }
        }

        [HttpPost("CreateBoard")]
        public async Task<IActionResult> CreateBoard([FromBody] string accessToken)
        {
            if (accessToken == null) return BadRequest("Access token not found.");
            var boardRequest = new
            {
                name = "Summer Recipes3",
                description = "My favorite summer recipes3",
                privacy = "PUBLIC"
            };

            var json = JsonConvert.SerializeObject(boardRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            var response = await _httpClient.PostAsync("https://api.pinterest.com/v5/boards", content);
            if (!response.IsSuccessStatusCode)
            {
                var errContent = await response.Content.ReadAsStringAsync();
            }
            var successContent = await response.Content.ReadAsStringAsync();

            return Ok(successContent);
        }

        [HttpPost("UploadPinterest")]
        public async Task<IActionResult> UploadPinterest(PinterestPost postData)
        {
            try
            {
                var authToken = await _platformConfigurationRepository.GetConfigurationValueByKey("AuthToken", PlatformType.Pinterest);

                if (string.IsNullOrEmpty(postData.access_token))
                {
                    return BadRequest("Access Token not found");
                }
                var pinRequest = new
                {
                    board_id = "948430071466987763",
                    title = postData.Title,
                    alt_text = postData.Description,
                    media_source = new
                    {
                        source_type = "image_url",
                        url = postData.imageUrl
                    }
                };
                var json = JsonConvert.SerializeObject(pinRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authToken);
                _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                var response = await _httpClient.PostAsync("https://api-sandbox.pinterest.com/v5/pins", content);
                var UploadedContent = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<object>(UploadedContent);

                return Ok(result);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet("GetVideoList")]
        public async Task<IActionResult> GetVideoList([FromQuery] string accesstoken)
        {
            try
            {
                var credential = GoogleCredential.FromAccessToken(accesstoken)
                .CreateScoped(YouTubeService.Scope.YoutubeReadonly);
                var youtubeService = new YouTubeService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "Campzeo"
                });
                var ChannelListRequest = youtubeService.Channels.List("snippet,contentDetails");
                ChannelListRequest.Mine = true;
                var channelResponse = await ChannelListRequest.ExecuteAsync();
                if (channelResponse.Items == null || channelResponse.Items.Count == 0)
                {
                    return NotFound("No YouTube channel found for the provided access token.");
                }
                var videos = new List<Video>();
                foreach (var channel in channelResponse.Items)
                {
                    var uploadsId = channel.ContentDetails?.RelatedPlaylists?.Uploads;
                    var nextPageToken = string.Empty;
                    while (nextPageToken != null)
                    {
                        var videoListRequest = youtubeService.PlaylistItems.List("snippet");
                        videoListRequest.PlaylistId = uploadsId;
                        videoListRequest.MaxResults = 50; // Adjust as needed
                        videoListRequest.PageToken = nextPageToken;
                        var videoListResponse = await videoListRequest.ExecuteAsync();
                        if (videoListResponse.Items != null)
                        {
                            foreach (var item in videoListResponse.Items)
                            {
                                videos.Add(new Video
                                {
                                    Id = item.Snippet.ResourceId.VideoId,
                                    Snippet = new VideoSnippet
                                    {
                                        Title = item.Snippet.Title,
                                        Description = item.Snippet.Description,
                                        Thumbnails = item.Snippet.Thumbnails
                                    }
                                });
                            }
                        }
                        nextPageToken = videoListResponse.NextPageToken;
                    }
                }
                return Ok(videos);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet("GetCommentsList")]
        public async Task<IActionResult> GetCommentsList([FromQuery] string accessToken, [FromQuery] string videoId)
        {
            try
            {
                if (string.IsNullOrEmpty(accessToken) || accessToken == null)
                {
                    return BadRequest("Access token is required.");
                }
                if (string.IsNullOrEmpty(videoId) || videoId == null)
                {
                    return BadRequest("Video ID is required.");
                }
                var credential = GoogleCredential.FromAccessToken(accessToken)
                    .CreateScoped(YouTubeService.Scope.YoutubeReadonly);
                var youtubeService = new YouTubeService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "Campzeo"
                });
                var commentRequest = youtubeService.CommentThreads.List("snippet");
                commentRequest.VideoId = videoId;
                commentRequest.MaxResults = 50;
                var commentResponse = await commentRequest.ExecuteAsync();
                if (commentResponse.Items == null || commentResponse.Items.Count == 0)
                {
                    return NotFound("No comments found for the provided video ID.");
                }
                var comments = commentResponse.Items.Select(c => new
                {
                    Id = c.Id,
                    Author = c.Snippet.TopLevelComment.Snippet.AuthorDisplayName,
                    Text = c.Snippet.TopLevelComment.Snippet.TextDisplay,
                    LikeCount = c.Snippet.TopLevelComment.Snippet.LikeCount,
                    PublishedAt = c.Snippet.TopLevelComment.Snippet.PublishedAtDateTimeOffset,
                    VideoId = c.Snippet.TopLevelComment.Snippet.VideoId,
                }).ToList();
                return Ok(comments);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        [HttpGet("PinterestAccount")]
        public async Task<IActionResult> PinterestAccount([FromQuery] string accessToken)
        {
            try
            {
                if (accessToken == null || string.IsNullOrEmpty(accessToken))
                {
                    return BadRequest("URL and Access Token are required.");
                }

                var request = new HttpRequestMessage(HttpMethod.Get, "https://api.pinterest.com/v5/user_account");
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return BadRequest(new { error = "Failed to fetch Pinterest account", response = errorContent });
                }
                var content = await response.Content.ReadAsStringAsync();
                var data = JsonConvert.DeserializeObject<PinterestProfile>(content);
                var result = JsonObject.Parse(content);
                if (data == null)
                {
                    return NotFound("Pinterest account not found.");
                }
                var pinterestAccount = new
                {
                    Id = data.Id,
                    Username = data.Username,
                    BusinessName = data.Business_Name,
                    FollowerCount = data.FollowerCount,
                    FollowingCount = data.FollowingCount,
                    ProfileImageUrl = data.Profile_Image
                };
                return Ok(pinterestAccount);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        [HttpGet("instagram-business-account")]
        public async Task<IActionResult> GetInstagramBusinessAccount([FromQuery] string pageId, [FromQuery] string accessToken)
        {
            var url = $"https://graph.facebook.com/v19.0/{pageId}?fields=instagram_business_account&access_token={accessToken}";
            var response = await _httpClient.GetAsync(url);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(new { error = "Failed to get Instagram Business Account", response = content });
            }
            var data = JsonConvert.DeserializeObject<dynamic>(content);
            string igUserId = data.instagram_business_account?.id;

            if (string.IsNullOrEmpty(igUserId))
                return NotFound("Instagram Business Account not connected to this page.");
            return Ok(new { instagramUserId = igUserId });
        }

        [HttpPost("post-instagram")]
        public async Task<IActionResult> PostToInstagram([FromBody] InstagramPostRequest post)
        {
            string mediaId = null;

            if (!string.IsNullOrEmpty(post.ImageUrl))
            {
                string imageUrlToUse = post.ImageUrl;
                if (post.ImageUrl.StartsWith("/uploads/") || post.ImageUrl.Contains("localhost") || post.ImageUrl.Contains(Request.Host.Value))
                {
                    string fileName;
                    if (post.ImageUrl.StartsWith("/uploads/"))
                        fileName = post.ImageUrl.Substring("/uploads/".Length);
                    else
                    {
                        var uri = new Uri(post.ImageUrl);
                        fileName = uri.Segments.Last();
                    }
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);
                    if (!System.IO.File.Exists(filePath))
                        return NotFound("Image file not found on server.");
                    imageUrlToUse = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                }
                var createMediaUrl = $"https://graph.facebook.com/v21.0/{post.InstagramUserId}/media";
                var mediaParams = new Dictionary<string, string>
             {
                { "image_url", imageUrlToUse },
                { "caption", post.Caption ?? "" },
                { "access_token", post.AccessToken }
             };

                var response = await _httpClient.PostAsync(createMediaUrl, new FormUrlEncodedContent(mediaParams));
                var result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return BadRequest(new { error = "Image upload failed", response = result });

                mediaId = JObject.Parse(result)["id"]?.ToString();
            }
            else if (post.Videos?.Any() == true)
            {
                string videoUrlToUse = post.Videos[0];
                if (videoUrlToUse.StartsWith("/uploads/") || videoUrlToUse.Contains("localhost") || videoUrlToUse.Contains(Request.Host.Value))
                {
                    string fileName;
                    if (videoUrlToUse.StartsWith("/uploads/"))
                        fileName = videoUrlToUse.Substring("/uploads/".Length);
                    else
                    {
                        var uri = new Uri(videoUrlToUse);
                        fileName = uri.Segments.Last();
                    }
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);
                    if (!System.IO.File.Exists(filePath))
                        return NotFound("Video file not found on server.");
                    videoUrlToUse = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                }
                var createMediaUrl = $"https://graph.facebook.com/v21.0/{post.InstagramUserId}/media";
                var mediaParams = new Dictionary<string, string>
            {
                { "media_type", "REELS" },
                { "video_url", videoUrlToUse },
                { "caption", post.Caption ?? "" },
                { "access_token", post.AccessToken }
            };

                var response = await _httpClient.PostAsync(createMediaUrl, new FormUrlEncodedContent(mediaParams));
                var result = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                    return BadRequest(new { error = "Video upload failed", response = result });

                mediaId = JObject.Parse(result)["id"]?.ToString();
            }

            if (string.IsNullOrEmpty(mediaId))
                return BadRequest("Media creation failed.");

            string mediaStatus = null;
            int attempts = 0;
            const int maxAttempts = 5;
            const int delayBetweenAttempts = 5000;
            while (attempts < maxAttempts)
            {
                var checkMediaUrl = $"https://graph.facebook.com/v21.0/{mediaId}?fields=status_code&access_token={post.AccessToken}";
                var checkResponse = await _httpClient.GetAsync(checkMediaUrl);
                var checkResult = await checkResponse.Content.ReadAsStringAsync();
                mediaStatus = JObject.Parse(checkResult)["status_code"]?.ToString();

                if (mediaStatus == "FINISHED")
                {
                    break;
                }

                attempts++;
                if (attempts < maxAttempts)
                {
                    await Task.Delay(delayBetweenAttempts);
                }
            }

            if (mediaStatus != "FINISHED")
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

            if (!publishResponse.IsSuccessStatusCode)
                return BadRequest(new { error = "Publish failed", response = publishContent });
            var publishResult = JObject.Parse(publishContent);
            var createdPostId = publishResult["id"]?.ToString();

            var mediaUrls = new List<string>();
            if (!string.IsNullOrEmpty(post.ImageUrl))
                mediaUrls.Add(post.ImageUrl);
            if (post.Videos != null)
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
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

                var fileName = $"{Guid.NewGuid()}.{extension}";
                var filePath = Path.Combine(folder, fileName);

                var base64Data = base64.Substring(base64.IndexOf(",") + 1);
                var fileBytes = Convert.FromBase64String(base64Data);
                await System.IO.File.WriteAllBytesAsync(filePath, fileBytes);

                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
                return Ok(new { fileUrl });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Failed to upload media", detail = ex.Message });
            }
        }


        [RequestSizeLimit(104_857_600)]
        [HttpPost("upload-video-file")]
        public async Task<IActionResult> UploadVideoFile([FromForm] VideoUploadDto dto)
        {
            var file = dto.File;

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            try
            {
                var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
                if (!Directory.Exists(uploadFolder))
                {
                    Directory.CreateDirectory(uploadFolder);
                }

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";

                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Upload failed.", error = ex.Message });
            }
        }

        [HttpGet("get-post-insights")]
        public async Task<IActionResult> GetPostInsights(string postId, string accessToken, string platform)
        {
            if (platform.ToLower() == "facebook")
            {
                var insightsUrl = $"https://graph.facebook.com/v21.0/{postId}/insights?metric=post_impressions,post_engaged_users,post_reactions_like_total,post_reactions_love_total&access_token={accessToken}";
                //var insightsUrl = $"https://graph.facebook.com/v21.0/{postId}/insights?metric=post_impressions,post_engaged_users,post_clicks,post_reactions_by_type_total&access_token={accessToken}";
                var summaryUrl = $"https://graph.facebook.com/v21.0/{postId}?fields=shares,comments.summary(true),reactions.summary(true)&access_token={accessToken}";

                var insightsResponse = await _httpClient.GetAsync(insightsUrl);
                var insightsContent = await insightsResponse.Content.ReadAsStringAsync();

                var summaryResponse = await _httpClient.GetAsync(summaryUrl);
                var summaryContent = await summaryResponse.Content.ReadAsStringAsync();

                if (!insightsResponse.IsSuccessStatusCode || !summaryResponse.IsSuccessStatusCode)
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
            else if (platform.ToLower() == "instagram")
            {
                var url = $"https://graph.facebook.com/v21.0/{postId}/insights?metric=impressions,reach,engagement,saved,video_views&access_token={accessToken}";
                var response = await _httpClient.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
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
                var user = await _userRepository.GetAsync(x => x.Token == apiReq.Token);
                // Step 1: Register the upload (if it's an image or video)
                var post = apiReq.Data;
                if (user == null || string.IsNullOrEmpty(user.LinkedInAccessToken))
                    return BadRequest("User not found or LinkedIn access token is missing.");
                string uploadedMediaUrn = null;
                if (!string.IsNullOrEmpty(post.ImageUrl))
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
                    if (!registerResponse.IsSuccessStatusCode)
                        return BadRequest(new { error = "Register upload failed", response = registerResult });

                    var registerObj = JObject.Parse(registerResult);
                    var uploadUrl = registerObj["value"]?["uploadMechanism"]?["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?["uploadUrl"]?.ToString();
                    uploadedMediaUrn = registerObj["value"]?["asset"]?.ToString();

                    if (!string.IsNullOrEmpty(uploadUrl))
                    {
                        using var imageResponse = await _httpClient.PutAsync(uploadUrl, new StreamContent(await _httpClient.GetStreamAsync(post.ImageUrl)));
                        if (!imageResponse.IsSuccessStatusCode)
                            return BadRequest("Image upload to LinkedIn failed.");
                    }
                }

                // Step 2: Post the UGC post
                var postUrl = "https://api.linkedin.com/v2/ugcPosts";
                var postBody = new Dictionary<string, object>
                {
                    ["author"] = user.LinkedInAuthUrn,
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

                if (!publishResponse.IsSuccessStatusCode)
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
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

    }
}