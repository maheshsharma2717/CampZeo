using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationDetail;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Commands.AddOrganization {
    public class CreateOrganizationCommandResponse : BaseResponse
    {
        public CreateOrganizationCommandResponse() : base()
        { 

        }

        public OrganizationDetailVm organization { get; set; } = default;
    }
}
