using MC.Basic.Domains;
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
        public string? Subject { get; set; }
        public string? Message { get; set; }
        public string? SenderEmail { get; set; }
        public PlatformType Type { get; set; }  
        public bool IsAttachedToCampaign { get; set; } = false;

        public long? CampaignId { get; set; }
        public string? VideoUrl { get; set; }
        public string? VideoId { get; set; }
        public DateTime? ScheduledPostTime { get; set; }
        public bool IsPostSent { get; set; } = false;
    }

}
