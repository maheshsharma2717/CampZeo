
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;

namespace MC.Basic.Application.Contracts.Persistance;

public interface ICampaignRepository: IAsyncRepository<Campaign>
{
    Task<Campaign> CreateUpdateCampaign(Campaign campaign, long OrganisationId);
    Task<List<Campaign>> GetCampaignsForOrganisation(long OrganisationId);
   // Task<Campaign> GetCampaignsForMessageTemplate(long Id);
   //Task<CampaignMessageTemplates> GetCampaignsMessageTemplateWithIncludes(long Id);
    Task<List<Campaign>> GetCampaignsByIds(List<long?> campaignIds);
}
