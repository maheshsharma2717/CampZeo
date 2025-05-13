using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Features.Organizations.Commands.DeleteOrganization {
    public class DeleteOrganizationCommand: IRequest 
    {
        public int Id { get; set; }
    }
}
