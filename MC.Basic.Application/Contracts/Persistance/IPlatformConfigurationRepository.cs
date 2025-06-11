using MC.Basic.Domains;
using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Persistance
{
    public interface IPlatformConfigurationRepository: IAsyncRepository<AdminPlatformConfiguration>
    {
        Task<string> GetConfigurationValueByKey(string key, PlatformType type);
    }
}
