using AutoMapper;
using MC.Basic.Application.Features.Organizations.Commands.AddOrganization;
using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationDetail;
using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationList;
using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {
            CreateMap<Organization, CreateOrganisationCommand>();
            CreateMap<Organization, OrganizationListVm>().ReverseMap();
            CreateMap<Organization, OrganizationDetailVm>().ReverseMap();
        }
    }
}
