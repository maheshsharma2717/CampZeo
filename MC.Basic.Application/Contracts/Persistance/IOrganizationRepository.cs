using MC.Basic.Domains.Entities;

namespace MC.Basic.Application.Contracts.Persistance 
{
    public interface IOrganisationRepository : IAsyncRepository<Organisation>
    {
        Task<Organisation> ApproveOrganisation(long id);
        Task<User> CreateOrganisationUser(Organisation dbOrganisation, string password);
        Task<Organisation> CreateOrUpdate(Organisation organisation);
        Task<Organisation> SuspendOrRecoverOrganisation(long id);
        Task<Organisation> GetOrganisationByOrganisationId(long id);
    }
}
