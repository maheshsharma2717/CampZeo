using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class ContactController  : ControllerBase
{
    private readonly IApplicationService _applicationService;
    public ContactController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }
    [HttpPost("CreateContact")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateContact(ApiRequest<Contact> request)
    {
        try
        {
            var response = await _applicationService.CreateContact(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost("GetContacts")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetContact(ApiRequest<Contact> request)
    {
        try
        {
            var response = await _applicationService.GetContacts(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    } 
    [HttpPost("GetContact")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetContact(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetContactById(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }
    [HttpPost("ImportContact")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> ImportContact([FromForm]ApiRequest<IFormFile> request)
    {
        try
        {
                var response = await _applicationService.ImportContact(request);
                return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}
