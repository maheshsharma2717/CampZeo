using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domain;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance.Repositories
{
    public class PlatformConfigurationRepository: BaseRepository<AdminPlatformConfiguration>, IPlatformConfigurationRepository
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        BasicDbContext dbcontext;
        public PlatformConfigurationRepository(BasicDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
        {
            dbcontext = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<string> GetConfigurationValueByKey(string key ,PlatformType type)
        {
            var result = await dbcontext.AdminPlatformConfigurations
                .SingleOrDefaultAsync(x => x.Key.ToLower() == key.ToLower() && x.Platform== type);
            if (result!=null) return result.Value??"";
            else return "";
        }
    }
}
