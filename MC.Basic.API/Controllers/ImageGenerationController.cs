using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using MC.Basic.API.Helpers;
using System.Threading.Tasks;

namespace MC.Basic.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ImageGenerationController : ControllerBase
{
    private readonly IImageGenerationService _imageGenerationService;
    public ImageGenerationController(IImageGenerationService imageGenerationService)
    {
        _imageGenerationService = imageGenerationService;
    }

    [HttpPost("GenerateImage")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GenerateImage([FromBody] ImageGenerationRequest request)
    {
        try
        {
            var result = await _imageGenerationService.GenerateImageAsync(request.Prompt);
            return Ok(new { imageUrl = result });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class ImageGenerationRequest
{
    public string Prompt { get; set; }
} 