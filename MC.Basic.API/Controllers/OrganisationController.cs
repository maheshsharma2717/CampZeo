using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Organisation;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers;
[Route("api/[controller]")]
[ApiController]
public class OrganisationController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly IAuthenticationService _authenticationService;
    public OrganisationController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }
    //TODO
    [HttpPost("CreateOrganisation")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateOrganisation(ApiRequest<OrganisationCreateDto> request)
    {
        try
        {
            var response = await _applicationService.CreateOrganisation(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("ApproveOrganisation")]
    [Authorize]
    [AdminOnly]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> ApproveOrganisation(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.ApproveOrganisation(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("GetOrganisation")]
    [Authorize]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetOrganisation(ApiRequest<FilteredList> request)
    {
        try
        {
            var response = await _applicationService.GetOrganisation(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("SuspendOrRecoverOrganisation")]
    [Authorize]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> SuspendOrRecoverOrganisation([FromBody] ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.SuspendOrRecoverOrganisation(request);
            return Ok(response);  
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message); 
        }
    }
    //ToDO
    //[HttpPost("SelectOrganisation")]
    //[AdminOnly]
    //[EnableCors("CorsPolicy")]
    //public async Task<IActionResult> SelectOrganisation(ApiRequest<long> request)
    //{
    //    try
    //    {
    //        var response = await _authenticationService.updateJwtToken(request);
    //        return Ok(response);
    //    }
    //    catch(Exception ex)
    //    {
    //        return BadRequest(ex);
    //    }
    //}

    [HttpPost("GetOrgenisationById")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetOrgenisationById([FromBody] ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetOrgenisationById(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

}
