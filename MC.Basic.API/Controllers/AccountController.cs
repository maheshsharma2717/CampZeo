using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.Authentication;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Organisation;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IApplicationService _service;
        public AccountController(IAuthenticationService authenticationService,IApplicationService service)
        {
            _service = service;
            _authenticationService = authenticationService;
        }
        [HttpPost("Login")]
        [EnableCors("CorsPolicy")]
        public async Task<IActionResult> LoginUser(LoginRequest request)
        {
            try
            {
                var loginUserResponse = await _authenticationService.AuthenticateUser(request.Email, request.Password);
                return Ok(loginUserResponse);
            }
            catch(Exception ex)
            {
                return BadRequest(ex);
            }

        }
        [HttpGet("LogInAsOrgenisation")]
        [EnableCors("CorsPolicy")]
        public async Task<IActionResult> LogInAsOrgenisation(int Id)
        {
            try
            {
                var loginUserResponse = await _authenticationService.LogInAsOrgenisation(Id);
                return Ok(loginUserResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex);
            }

        }


        [HttpPost("ValidateToken")]
        [EnableCors("CorsPolicy")]
        public async Task<IActionResult> ValidateToken([FromForm] string token)
        {
            try
            {
                var loginUserResponse = await _authenticationService.ValidateToken(token);
                return Ok(loginUserResponse);
            }
            catch(Exception ex)
            {
                return BadRequest(ex);
            }
        }

        [HttpPost("UpdateUser")]
        [Authorize]
        [EnableCors("CorsPolicy")]
        public async Task<IActionResult> CreateAdminUser(ApiRequest<User> request)
        {
            try
            {
                var loginUserResponse = await _service.UpdateUser(request);
                return Ok(loginUserResponse);
            }
            catch(Exception ex)
            {
                return BadRequest(ex);
            }
        }   
        
        [HttpPost("UpdatePassword")]
        [Authorize]
        [EnableCors("CorsPolicy")]
        public async Task<IActionResult> UpdatePassword(ApiRequest<UpdatePasswordRequest> request)
        {
            try
            {
                var loginUserResponse = await _authenticationService.UpdateUserPassword(request);
                return Ok(loginUserResponse);
            }
            catch(Exception ex)
            {
                return BadRequest(ex);
            }
        }   

        [HttpPost("CreateAdminUser")]
        [EnableCors("CorsPolicy")]
        public async Task<IActionResult> CreateAdminUser(string firstName, string lastName, string email, string password)
        {
            try
            {
                var user = await _authenticationService.CreateAdminUser(firstName, lastName, email, password);

                if (user == null || user.Id == 0)
                    return Conflict("Admin user already exists.");

                var result = new AdminUserResponseDto
                {
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role.ToString(),
                    IsApproved = user.IsApproved
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal Server Error", error = ex.Message });
            }
        }
    }
}
