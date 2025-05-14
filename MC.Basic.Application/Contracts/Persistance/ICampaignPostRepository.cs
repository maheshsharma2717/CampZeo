
using MC.Basic.Domains.Entities;

namespace MC.Basic.Application.Contracts.Persistance;

    public interface ICampaignPostRepository : IAsyncRepository<CampaignPost>
    {
        Task<CampaignPost> CreateUpdateMessageTemplate(CampaignPost data, long OrganisationId);
        Task<List<CampaignPost>> GetMessageTemplatesForOrganisation(long OrganisationId);

    }

