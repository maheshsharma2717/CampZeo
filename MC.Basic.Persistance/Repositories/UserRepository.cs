using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {

        public UserRepository(BasicDbContext context) : base(context)
        {
        }
        public async Task<User> CreateUpdateUser(User user)
        {
            var dbUser = await GetAsyncById(user.Id);
            if(dbUser == null)
            {
                dbUser = await AddAsync(user);
            }
            else
            {
                dbUser.Id = user.Id;
                dbUser.CreatedBy = user.CreatedBy;
                dbUser.LastModifiedBy = user.LastModifiedBy;
                dbUser.CreatedDate = user.CreatedDate;
                dbUser.LastModifiedDate = user.LastModifiedDate;
                dbUser.Mobile = user.Mobile;
                dbUser.FirstName = user.FirstName;
                dbUser.LastName = user.LastName;
                dbUser.Role = user.Role;
                dbUser = await UpdateAsync(dbUser);
            }
            return dbUser;
        }
        public async Task<User> CreateOrganisationUser(Organisation dbOrganisation, string password)
        {
            var dbUser = await AddAsync(new User
            {
                Email = dbOrganisation.Email,
                Password = password,
                IsApproved = dbOrganisation.IsApproved,
                OrganisationId = dbOrganisation.Id
            });
            return dbUser;
        }
        public async Task<User> GetUserWithOrganisation(string token)
        {
            return await GetRecordWithIncludes(x => x.Organisation, x => x.Token == token && x.IsApproved);
        }

    }
}
