using MC.Basic.Domains.Entities;

namespace MC.Basic.Application.Contracts.Persistance
{
    public interface IUserRepository : IAsyncRepository<User>
    {
        Task<User> CreateOrganisationUser(Organisation dbOrganisation, string password);
        Task<User> CreateUpdateUser(User dbUser);
        Task<User> GetUserWithOrganisation(string token);
    }
}
