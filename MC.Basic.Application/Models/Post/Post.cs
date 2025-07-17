using MC.Basic.Domains;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Globalization;
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
    public class YouTubeUploadRequest
    {
        public string AccessToken { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<string> Tags { get; set; }
        public string CategoryId { get; set; } = "22";
        public string PrivacyStatus { get; set; } = "unlisted";
        public string VideoUrl { get; set; }
        public List<string> Videos { get; set; }
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


    //for share post 
    public class CampaignPostRequest
    {
        public int CampaignId { get; set; }
        public PlatformType Type { get; set; } 
        public string Message { get; set; }
        public List<ContactModel> Contacts { get; set; }
    }
    public class ContactModel
    {
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactMobile { get; set; }
        public string ContactWhatsApp { get; set; }
    }

    public class PinterestProfile
    {
        public string WebsiteUrl { get; set; }
        public string Username { get; set; }
        public int pin_count { get; set; }
        public string AccountType { get; set; }
        public int FollowerCount { get; set; }
        public string About { get; set; }
        public int BoardCount { get; set; }
        public int FollowingCount { get; set; }
        public int MonthlyViews { get; set; }
        public string Id { get; set; }
        public string Profile_Image { get; set; }
        public string Business_Name { get; set; }
    }
    
    public class PinterestTokenResponse
    {
        public string access_token { get; set; }
        public string refresh_token { get; set; }
    }

    public class PinterestPost
    {
        public string access_token { get; set; }
        public string imageUrl { get; set; }
        public string BoardId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }
}
