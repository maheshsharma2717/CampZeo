using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class Campaign : AuditableEntity
    {
        public Campaign()
        {
            CampaignPost = new List<CampaignPost>();
        }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public long? OrganisationId { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<CampaignPost> CampaignPost { get; set; }
    }
}
