namespace MC.Basic.Domains.Entities
{
    public class OrganisationPlatform
    {
        public long Id { get; set; }
        public Organisation? Organisation { get; set; }
        public long OrganisationId { get; set; }
        public PlatformType Platform { get; set; }
    }
}
