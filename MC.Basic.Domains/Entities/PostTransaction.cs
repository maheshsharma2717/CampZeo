using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class PostTransaction:AuditableEntity
    {
        public int Id { get; set; }
        public int RefId { get; set; }  // From Facebook
        public string Platform { get; set; }
        public string PostId { get; set; }
        public string AccountId { get; set; }
        public string Message { get; set; }
        public string MediaUrls { get; set; }
        public string PostType { get; set; }

        public DateTime CreatedAt { get; set; }
        public string AccessToken { get; set; }

        public bool IsScheduled { get; set; }
        public DateTime? ScheduledTime { get; set; }

        public bool Published { get; set; }
        public DateTime? PublishedAt { get; set; }

        public bool InsightsFetched { get; set; }
        public DateTime? LastInsightsCheck { get; set; }
    }

}
