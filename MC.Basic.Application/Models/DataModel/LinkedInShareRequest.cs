using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.DataModel
{
    public class LinkedInShareRequest
    {
        public string AccessToken { get; set; }
        public string AuthorUrn { get; set; }  // e.g., "urn:li:person:123abc..."
        public string Title { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
    }
    public class LinkedInTokenResponse
    {
        [JsonProperty("access_token")]
        public string AccessToken { get; set; }

        [JsonProperty("expires_in")]
        public int ExpiresIn { get; set; }
    }
}
    