using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using MC.Basic.API.Helpers;
using System.Threading.Tasks;

namespace MC.Basic.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TextGenerationController : ControllerBase
{
    private readonly ITextGenerationService _textGenerationService;
    public TextGenerationController(ITextGenerationService textGenerationService)
    {
        _textGenerationService = textGenerationService;
    }

    [HttpPost("GenerateText")]
    [EnableCors("CorsPolicy")]
    public async Task<IActionResult> GenerateText([FromBody] TextGenerationRequest request)
    {
        try
        {
            var result = await _textGenerationService.GenerateTextAsync(request.Prompt);
            return Ok(new { response = result });
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

public class TextGenerationRequest
{
    public string Prompt { get; set; }
} 