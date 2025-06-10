namespace MC.Basic.Application.Models.DataModel
{
    public class SaveCampaignWithTemplateDto
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsEmailCampaign { get; set; }
        public bool IsSmsCampaign { get; set; }
        public bool IsWhatsAppCampaign { get; set; }
        public bool IsRCSCampaign { get; set; }
        public bool IsFacebookCampaign { get; set; }
        public bool IsInstagramCampaign { get; set; }
        public List<CampaignPostDto> CampaignMessageTemplates { get; set; } = new();
    }

    public class CampaignPostDto
    {
        public long Id { get; set; }
        public string? Subject { get; set; }
        public string? Message { get; set; }
        public string? SenderEmail { get; set; }
        public string? OrganisationName { get; set; }
        public int Type { get; set; }
        public string? VideoUrl { get; set; }
        public DateTime? ScheduledPostTime { get; set; }
    }

}
