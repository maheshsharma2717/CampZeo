using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Persistance
{
    public interface IUserRepository : IAsyncRepository<User>
    {
        Task<User> CreateOrganisationUser(Organisation dbOrganisation, string password);
        Task<User> CreateUpdateUser(User dbUser);
        Task<User> GetUserWithOrganisation(string token);
    }
}
