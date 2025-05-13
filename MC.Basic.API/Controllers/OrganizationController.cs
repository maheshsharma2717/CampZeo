using MC.Basic.API.Helpers;
using MC.Basic.Application.Features.Organizations.Commands.AddOrganization;
using MC.Basic.Application.Features.Organizations.Commands.DeleteOrganization;
using MC.Basic.Application.Features.Organizations.Commands.UpdateOrganization;
using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationList;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers {

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrganizationController : ControllerBase {
       private readonly IMediator _mediator;

        public OrganizationController(IMediator mediator) 
        {
            _mediator = mediator;
        }

        [HttpGet("all", Name = "GetAllOrgs")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<OrganizationListVm>>> GetAllOrganizations() 
        {
            var dtos = await _mediator.Send(new GetOrganizationsListQuery());
            return Ok(dtos);
        }

        [HttpPost("AddOrg")]
        public async Task<ActionResult<CreateOrganizationCommandResponse>> Create([FromBody]CreateOrganisationCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
            
        }

        [HttpPost("UpdateOrg")]
        public async Task<ActionResult> update(UpdateOrganisationCommand command) {
             await _mediator.Send(command);
            return Ok();

        }

        [HttpPost("DeleteOrg")]
        public async Task<ActionResult> Delete(DeleteOrganizationCommand command) {
            await _mediator.Send(command);
            return Ok();

        }
    }
}
