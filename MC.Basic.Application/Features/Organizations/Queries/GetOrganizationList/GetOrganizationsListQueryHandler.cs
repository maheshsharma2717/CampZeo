using AutoMapper;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Queries.GetOrganizationList
{
    public class GetOrganizationsListQueryHandler : IRequestHandler<GetOrganizationsListQuery, List<OrganizationListVm>>
    {
        private readonly IAsyncRepository<Organisation> _organizationRepository;
        private readonly IMapper _mapper;

        public GetOrganizationsListQueryHandler(IMapper mapper, IAsyncRepository<Organisation> organizationRepository)
        {
            _mapper = mapper;
            _organizationRepository = organizationRepository;
        }
        public async Task<List<OrganizationListVm>> Handle(GetOrganizationsListQuery request, CancellationToken cancellationToken)
        {
            var allOrgs = (await _organizationRepository.ListAllAsync()).OrderBy(x => x.Id);
            return _mapper.Map<List<OrganizationListVm>>(allOrgs);
        }
    }
}
