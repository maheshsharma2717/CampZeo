
using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.Calender;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Post;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace MC.Basic.API.Controllers;

[Route("api/[controller]")]
[Authorize]
[ApiController]
public class CampaignController : ControllerBase
{
    private readonly IApplicationService _applicationService;
    public CampaignController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }
    [HttpPost("CreateCampaign")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateCampaign(ApiRequest<Campaign> request)
    {
        try
        {
            var response = await _applicationService.CreateCampaign(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    //[HttpPost("CreateCampaignMessageTemplate")]
    //[EnableCors("CorsPolicy")]
    //public async Task<IActionResult> CreateCampaignMessageTemplate(ApiRequest<List<CampaignPostDto>> request)
    //{
    //    try
    //    {
    //        var response = await _applicationService.CreateCampaignMessageTemplate(request);
    //        return Ok(response);
    //    }
    //    catch (Exception ex)
    //    {
    //        return BadRequest(ex);
    //    }
    //}

    [HttpPost("GetCampaigns")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetCampaign(ApiRequest<FilteredList> request)
    {
        try
        {
            var response = await _applicationService.GetCampaigns(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }


    //[HttpPost("GetCampaignTemplates")]
    //[EnableCors("CorsPolicy")]
    //public async Task<IActionResult> GetCampaignTemplates(ApiRequest<long> request)
    //{
    //    try
    //    {
    //        var response = await _applicationService.GetCampaignsTemplates(request);
    //        return Ok(response);
    //    }
    //    catch (Exception ex)
    //    {
    //        return BadRequest(ex);
    //    }
    //}

    [HttpPost("GetCampaignDetails")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetCampaignDetails(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetCampaignById(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }


    [HttpPost("GetEventForCampaignPost")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetEventForCampaign(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetEventForCampaignPost(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    //[HttpPost("SendBulkMessagetoContacts")]
    //[EnableCors("CorsPolicy")]
    //public async Task<IActionResult> SendBulkMessagetoContacts(ApiRequest<BulkMessageRequest> request)
    //{
    //    try
    //    {
    //        var response = await _applicationService.SendBulkMessagetoContacts(request);
    //        return Ok(response);
    //    }
    //    catch (Exception ex)
    //    {
    //        return BadRequest(ex);
    //    }
    //}

    [HttpPost("CheckEmailLogs")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CheckEmailStatus(ApiRequest<ReportLogRequest> request)
    {
        try
        {
            var response = await _applicationService.GetMailgunReports(request.Data.Email, request.Data.Events);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("CheckMessageLogs")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CheckMessageLogs(ApiRequest<ReportLogRequest> request)
    {
        try
        {
            var response = await _applicationService.GetMessageinLogs();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
    [HttpPost("TestDevloper")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> TestPrompt(ApiRequest<string> request)
    {
        try
        {
            var response = await _applicationService.GetAnswerForQuestion(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }



    [HttpPost("GetScheduledPosts")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetScheduledPosts(ApiRequest<CalenderPostRequest> request)
    {
        try
        {
            var response = await _applicationService.GetScheduledPosts(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("send-campaign-post")]
    public async Task<IActionResult> SendCampaignPost(ApiRequest<CampaignPostRequest> request)
    {
        try
        {
            var response = await _applicationService.SendCampPost(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("DeleteCampaign")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> DeleteCampaign(ApiRequest<long> Id)
    {
        try
        {
            var response = await _applicationService.DeleteCampaignById(Id);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex);
        }
    }
}
