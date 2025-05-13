using MC.Basic.Application.Features.Authorization.Commands.Login;
using MC.Basic.Application.Features.Organizations.Commands.AddOrganization;
using MC.Basic.Application.Features.Organizations.Queries.GetOrganizationList;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Login")]
        public async Task<ActionResult<LoginCommandResponse>> Login([FromBody] LoginCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);

        }
    }
}
