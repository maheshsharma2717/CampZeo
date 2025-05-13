using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class CampaignPost:AuditableEntity
    {
        public string Subject { get; set; }
        public string Message { get; set; }
        public string SenderEmail { get; set; }
        public string OrganisationName { get; set; }
        public int Type { get; set; }  // Enum mapping (TemplateType)
        public bool IsAttachedToCampaign { get; set; } = false;

        public long? CampaignId { get; set; }
        public Campaign Campaign { get; set; }

        public long? OrganisationId { get; set; }
        public Organisation Organisation { get; set; }

        public string VideoUrl { get; set; }
        public DateTime? ScheduledPostTime { get; set; }
        public bool IsPostSent { get; set; } = false;
    }

}
