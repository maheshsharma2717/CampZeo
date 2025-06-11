using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Organisation;
using MC.Basic.Domains.Entities;
using MC.Basic.Persistance;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers;
[Route("api/[controller]")]
[ApiController]
public class OrganisationController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    private readonly IAuthenticationService _authenticationService;
    private readonly BasicDbContext _context;
    public OrganisationController(IApplicationService applicationService, BasicDbContext context)
    {
        _applicationService = applicationService;
        _context = context;
    }
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


    [HttpPut("UpdateOrganisation/{id}")]
    public IActionResult UpdateOrganisation(long id, [FromBody] OrganisationUpdateDto request)
    {
        if (request == null)
            return BadRequest("Organisation data is null.");

        var organisation = _context.Organizations.Find(id);
        if (organisation == null)
            return NotFound("Organisation not found.");

        organisation.Name = request.Name;
        organisation.OwnerName = request.OwnerName;
        organisation.Phone = request.Phone;
        organisation.Email = request.Email;
        organisation.Address = request.Address;
        organisation.City = request.City;
        organisation.State = request.State;
        organisation.Country = request.Country;
        organisation.PostalCode = request.PostalCode;

        _context.SaveChanges();

        return Ok(organisation);
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

    [HttpPost("GetOrganisationByOrganisationId")]
    [Authorize]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetOrganisationByOrganisationId([FromBody] ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetOrganisationByOrganisationId(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
