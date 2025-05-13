using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Commands.UpdateOrganization {
    public class UpdateOrganisationCommand : IRequest 
    {
        public int Id {  get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }

        public override string ToString() {
            return $"Organization name: {Name}; Description: {Description}; Address:{Address}";
        }
    }
}
