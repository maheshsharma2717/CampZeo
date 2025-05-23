using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.PlatformConfiguration;
using MC.Basic.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminPlatformConfigurationController : ControllerBase
    {
        private readonly IApplicationService _applicationService;
        public AdminPlatformConfigurationController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }
        [HttpPost("GetPlatformConfiguration")]
        [AdminOnly]
        public async Task<IActionResult> GetPlatformConfiguration(ApiRequest<PlatformType> request)
        {
            try
            {
                var response = await _applicationService.GetPlatformConfiguration(request);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        } 
        
        [HttpPost("UpdatePlatformConfiguration")]
        [AdminOnly]
        public async Task<IActionResult> UpdatePlatformConfiguration(ApiRequest<PlatformConfigurationDto> request)
        {
            try
            {
                var response = await _applicationService.UpdatePlatformConfiguration(request);
                return Ok(response);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
