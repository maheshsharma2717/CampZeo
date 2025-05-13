using MC.Basic.Domains.Common;

namespace MC.Basic.Domains.Entities
{
    public class PostInsight:AuditableEntity
    {
        public string PostId { get; set; }
        public int Likes { get; set; } = 0;
        public int Comments { get; set; } = 0;
        public int Reach { get; set; } = 0;
        public int Impressions { get; set; } = 0;
        public float EngagementRate { get; set; } = 0f;
        public DateTime LastUpdated { get; set; }
    }
}
