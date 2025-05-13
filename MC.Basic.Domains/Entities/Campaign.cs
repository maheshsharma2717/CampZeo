using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class Campaign : AuditableEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsEmailCampaign { get; set; } = false;
        public bool IsWhatsAppCampaign { get; set; } = false;
        public bool IsSmsCampaign { get; set; } = false;
        public bool IsRCSCampaign { get; set; } = false;
        public bool IsFacebookCampaign { get; set; } = false;
        public bool IsInstagramCampaign { get; set; } = false;

        public long? OrganisationId { get; set; }
        public Organisation Organisation { get; set; }

        public long? CampaignPostsId { get; set; }
        public CampaignPost CampaignPost { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
