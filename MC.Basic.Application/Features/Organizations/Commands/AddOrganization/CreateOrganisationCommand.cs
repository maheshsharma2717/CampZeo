using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Commands.AddOrganization {
    public class CreateOrganisationCommand : IRequest<CreateOrganizationCommandResponse> 
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public override string ToString()
        {
            return $"Organization name: {Name}; Description: {Description}; Address:{Address}";
        }
    }
}
