using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using MC.Basic.API.Helpers;
using OpenAI.Images;
using OpenAI;
using static System.Net.Mime.MediaTypeNames;
using Microsoft.AspNetCore.Authorization;
using static AiHordeClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Collections.Generic;
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


public class OpenAiController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public OpenAiController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("GenerateAI")]
    [AllowAnonymous]
    public async Task<IActionResult> GenerateAI([FromQuery] string prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt))
            return BadRequest("Prompt cannot be empty.");

        string apiKey = _configuration["OpenAI:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return BadRequest("OpenAI API key not configured.");

        var openAIClient = new OpenAIClient(new OpenAIAuthentication(apiKey));

        try
        {
            var request = new ImageGenerationRequest(
    prompt:prompt,
    model: OpenAI.Models.Model.DallE_2,
    numberOfResults: 1,
    quality: "low",
    outputFormat: "png",
    outputCompression: 100,
  
    user: "test-user-id"
);


            var imageResults = await openAIClient.ImagesEndPoint.GenerateImageAsync(request);


            var imageUrls = new List<string>();
            foreach (var result in imageResults)
            {
                imageUrls.Add(result?.Url);
            }

            return Ok(new { images = imageUrls });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error generating image: {ex.Message}");
        }
    }
}
public class AiHordeController : ControllerBase
{
    private readonly AiHordeClient _hordeClient;
    private static readonly Queue<DateTime> _requestTimestamps = new Queue<DateTime>();
    private static readonly object _rateLimitLock = new object();

    public AiHordeController(IConfiguration configuration)
    {
        _hordeClient = new AiHordeClient(configuration);
    }

    private async Task ThrottleIfNeededAsync()
    {
        DateTime now = DateTime.UtcNow;
        lock (_rateLimitLock)
        {
            while (_requestTimestamps.Count > 0 && (now - _requestTimestamps.Peek()).TotalSeconds > 60)
            {
                _requestTimestamps.Dequeue();
            }
            if (_requestTimestamps.Count >= 10)
            {
                var waitTime = 60 - (now - _requestTimestamps.Peek()).TotalSeconds;
                if (waitTime > 0)
                {
                    Monitor.Exit(_rateLimitLock);
                    try
                    {
                        Task.Delay((int)(waitTime * 1000)).Wait();
                    }
                    finally
                    {
                        Monitor.Enter(_rateLimitLock);
                    }
                }
            }
            _requestTimestamps.Enqueue(DateTime.UtcNow);
        }
    }

    private async Task<string> DownloadAndSaveImageAsync(string imageUrl, string uploadsFolder, string baseUrl)
    {
        using var httpClient = new HttpClient();
        var imageBytes = await httpClient.GetByteArrayAsync(imageUrl);
        var fileName = $"{Guid.NewGuid()}.png";
        var filePath = Path.Combine(uploadsFolder, fileName);
        await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);
        return $"{baseUrl}/uploads/{fileName}";
    }

    [HttpGet("Horde/Generate")]
  
    public async Task<IActionResult> GenerateImage([FromQuery] string prompt)
    {
        if (string.IsNullOrWhiteSpace(prompt))
            return BadRequest("Prompt cannot be empty.");

        try
        {
            await ThrottleIfNeededAsync();
            var submitJson = await _hordeClient.SubmitPromptAsync(prompt);
            var doc = JsonDocument.Parse(submitJson);
            var requestId = doc.RootElement.GetProperty("id").GetString();

            var images = await _hordeClient.WaitForImagesAsync(requestId);
            if (images == null || images.Count == 0)
                return StatusCode(504, "Image generation timed out.");

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var localImageUrls = new List<string>();
            foreach (var imageUrl in images)
            {
                var localUrl = await DownloadAndSaveImageAsync(imageUrl, uploadsFolder, baseUrl);
                localImageUrls.Add(localUrl);
            }
            return Ok(new { images = localImageUrls });

        }
        catch (Exception ex)
        {
            return StatusCode(500, $"AI Horde Error: {ex.Message}");
        }
    }

    [HttpPost("Horde/Edit")]
    public async Task<IActionResult> EditImage([FromBody] EditImageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt) || string.IsNullOrWhiteSpace(request.Base64Image))
            return BadRequest("Prompt and image are required.");

        try
        {
            string base64Image = request.Base64Image;

            if (!base64Image.StartsWith("data:image/"))
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
                var filePath = Path.Combine(uploadsFolder, base64Image);
                if (System.IO.File.Exists(filePath))
                {
                    var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                    var extension = Path.GetExtension(filePath).ToLowerInvariant();
                    string prefix = extension switch
                    {
                        ".png" => "data:image/png;base64,",
                        ".jpg" or ".jpeg" => "data:image/jpeg;base64,",
                        _ => throw new Exception("Unsupported file type")
                    };
                    base64Image = prefix + Convert.ToBase64String(fileBytes);
                }
                else
                {
                    return BadRequest("Referenced image file not found on server.");
                }
            }

            var submitJson = await _hordeClient.SubmitImageEditAsync(
                base64Image,
                request.Prompt,
                request.ProcessingType ?? "img2img");

            var doc = JsonDocument.Parse(submitJson);
            var requestId = doc.RootElement.GetProperty("id").GetString();

            var images = await _hordeClient.WaitForImagesAsync(requestId);
            if (images == null || images.Count == 0)
                return StatusCode(504, "Image editing timed out.");

            var uploadsFolderOut = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsFolderOut))
                Directory.CreateDirectory(uploadsFolderOut);
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var localImageUrls = new List<string>();
            foreach (var imageUrl in images)
            {
                var localUrl = await DownloadAndSaveImageAsync(imageUrl, uploadsFolderOut, baseUrl);
                localImageUrls.Add(localUrl);
            }
            return Ok(new { images = localImageUrls });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"AI Horde Error: {ex.Message}");
        }
    }



}