using MC.Basic.Domain;
using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class User:AuditableEntity
    {
        public string? Token { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsFirstLogin { get; set; } = true;
        public UserRole Role { get; set; } = UserRole.OrganisationUser;

        public long? OrganisationId { get; set; }
        [JsonIgnore]
        public Organisation? Organisation { get; set; }

        public string? FacebookAccessToken { get; set; }
        public string? FacebookTokenType { get; set; }
        public int? FacebookTokenExpiresIn { get; set; }
        public DateTime? FacebookTokenCreatedAt { get; set; }
        public string? FacebookUserId { get; set; }
        public string? FacebookPageId { get; set; }
        public string? FacebookPageAccessToken { get; set; }
        public string? InstagramAccessToken { get; set; }
        public string? InstagramUserId { get; set; }
        public DateTime? InstagramTokenCreatedAt { get; set; }
        public int? InstagramTokenExpiresIn { get; set; }

// LinkedIn fields

        public string? LinkedInAccessToken { get; set; } 
        public string? LinkedInAuthUrn { get; set; } 
    }
}
