using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MessageTemplateManagement.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class CampaignPostController  : ControllerBase
{
    private readonly IApplicationService _applicationService;
    public CampaignPostController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }
    [HttpPost("CreateMessageTemplate")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateMessageTemplate(ApiRequest<MC.Basic.Domains.Entities.CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.CreateMessageTemplate(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("CreateMessageTemplateFromCampain")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateMessageTemplateFromCampain(long campainId, ApiRequest<MC.Basic.Domains.Entities.CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.CreateMessageTemplateFromCampain( campainId, request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost("GetMessageTemplates")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetMessageTemplate(ApiRequest<MC.Basic.Domains.Entities.CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.GetMessageTemplates(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }



    [HttpPost("GetMessageTemplateDetails")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetMessageTemplateDetails(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetMessageTemplateById(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }

    
}
