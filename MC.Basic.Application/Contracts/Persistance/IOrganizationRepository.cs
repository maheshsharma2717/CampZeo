using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Persistance 
{
    public interface IOrganizationRepository: IAsyncRepository<Organization> 
    {
        Task<bool> IsOrganizationNameUnique(string? name);
    }
}
