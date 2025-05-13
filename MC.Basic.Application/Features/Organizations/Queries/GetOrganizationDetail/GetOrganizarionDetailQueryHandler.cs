using AutoMapper;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Queries.GetOrganizationDetail
{
    public class GetOrganizarionDetailQueryHandler : IRequestHandler<GetOrganizationDetailQuery, OrganizationDetailVm>
    {
        private readonly IAsyncRepository<Organisation> _organizationRepository;
        private readonly IMapper _mapper;

        public GetOrganizarionDetailQueryHandler(IMapper mapper, IAsyncRepository<Organisation> organizationRepository)
        {
            _mapper = mapper;
            _organizationRepository = organizationRepository;
        }

        public async Task<OrganizationDetailVm> Handle(GetOrganizationDetailQuery query, CancellationToken cancellationToken)
        {
            var org = await _organizationRepository.GetAsyncById(query.Id);
            return _mapper.Map<Organisation, OrganizationDetailVm>(org);
        }

    }
}
