using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance.Repositories {
    public class OrganizationRepository : BaseRepository<Organization>,IOrganizationRepository
    {
        public OrganizationRepository(BasicDbContext dbContext):base(dbContext) 
        {
            
        }

        public Task<bool> IsOrganizationNameUnique(string? name) 
        { 
            var matches = _dbContext.Organizations.Any(e => e.Name == name);
            return Task.FromResult(matches);
        }
    }
}
