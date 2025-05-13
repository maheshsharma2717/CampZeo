using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Queries.GetOrganizationList
{
    public class GetOrganizationsListQuery : IRequest<List<OrganizationListVm>>
    {
    }
}
