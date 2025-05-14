using MC.Basic.Domain;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.Post
{
    public class PostData
    {
        public string PageId { get; set; }
        public string PageAccessToken { get; set; }
        public string Message { get; set; }
        public List<string> Images { get; set; } = new();
        public List<string> Videos { get; set; } = new();
    }

    public class FacebookTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("token_type")]
        public string TokenType { get; set; }

        [JsonProperty("expires_in")]
        public int? ExpiresIn { get; set; }
    }
    public class FacebookAccountsResponse
    {
        [JsonProperty("data")]
        public List<FacebookPage> Data { get; set; }
    }
    public class FacebookPage
    {
        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }
    public class ExchangeTokenRequest
    {
        public string Code { get; set; }
        public int UserId { get; set; }
        public string Platform { get; set; }
    }

    public class FacebookSettings
    {
        public string AppId { get; set; }
        public string AppSecret { get; set; }
        public string RedirectUri { get; set; }
    }
    public class InstaSettings
    {
        public string AppId { get; set; }
        public string AppSecret { get; set; }
        public string RedirectUri { get; set; }
    }
    public class InstagramTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("user_id")]
        public string UserId { get; set; }
        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }
    }

    public class InstagramPostRequest
    {
        public string AccessToken { get; set; }
        public string InstagramUserId { get; set; }
        public string Caption { get; set; }

        public string? ImageUrl { get; set; }
        public List<string>? Videos { get; set; } = new();
    }

    public class InstagramMediaResponse
    {
        [JsonProperty("id")]
        public string Id { get; set; }
    }

    public class MediaUploadRequest
    {
        public string Base64 { get; set; }
    }
    public class ScheduledPostDto
    {
        public long TemplateId { get; set; }
        public string? CampaignName { get; set; }
        public long CampaignId { get; set; }
        public PlatformType TemplateType { get; set; }
        public DateTime ScheduledPostTime { get; set; }
        public string? Message { get; set; }
    }
    public class TemplateLookupDto
    {
        public int TemplateId { get; set; }
        public int Type { get; set; }
    }
    public class VideoUploadDto
    {
        public IFormFile File { get; set; }
    }

}
