using MC.Basic.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.Campaign
{
    public class CampaignListModel
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<CampaignPostCount> PostData{ get; set; } = new List<CampaignPostCount>();

    } 
    public class CampaignPostCount
    {
        public PlatformType Type{ get; set; }
        public int Count { get; set; }
    }
}
