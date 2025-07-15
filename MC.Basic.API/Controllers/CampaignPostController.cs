using MC.Basic.API.Helpers;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Post;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace MC.Basic.API.Controllers;

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
    [HttpPost("CreateCampaignPost")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateCampaignPost(ApiRequest<CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.CreateCampaignPost(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("CreateCampaignPostFromCampain")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> CreateCampaignPostFromCampain(long campainId, ApiRequest<MC.Basic.Domains.Entities.CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.CreateCampaignPostFromCampain( campainId, request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpPost("GetCampaignPosts")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetCampaignPost(ApiRequest<MC.Basic.Domains.Entities.CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.GetCampaignPosts(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }



    [HttpPost("GetCampaignPostsByCampaignId")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetCampaignPostDetails(ApiRequest<FilteredList> request)
    {
        try
        {
            var response = await _applicationService.GetCampaignPostsByCampaignId(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    } 
    
    [HttpPost("GetCampaignPostDetails")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GetCampaignPostDetails(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetCampaignPostById(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(ex);
        }
    }

    [HttpPost("GetPostById")]
    public async Task<IActionResult> GetPostById(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.GetPostById(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(new ApiResponse<string> { IsSuccess = false, Message = ex.Message });
        }
    }

    [HttpPost("DeleteCampaignPost")]
    public async Task<IActionResult> DeleteCampaignPost(ApiRequest<long> request)
    {
        try
        {
            var response = await _applicationService.DeleteCampaignPostById(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(new ApiResponse<string> { IsSuccess = false, Message = ex.Message });
        }
    }

    [HttpPost("UpdateCampaignPost")]
    public async Task<IActionResult> UpdateCampaignPost(ApiRequest<CampaignPost> request)
    {
        try
        {
            var response = await _applicationService.UpdateCampaignPost(request);
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(new ApiResponse<string> { IsSuccess = false, Message = ex.Message });
        }
    }
}
