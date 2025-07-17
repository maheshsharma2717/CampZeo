using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic; 
using Serilog;

namespace MC.Basic.API.Helpers;

public interface IImageGenerationService
{
    Task<string> GenerateImageAsync(string prompt);
}

public class ImageGenerationService : IImageGenerationService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    public ImageGenerationService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["DeepAI:ApiKey"];
        if (!_httpClient.DefaultRequestHeaders.Contains("api-key"))
        {
            _httpClient.DefaultRequestHeaders.Add("api-key", _apiKey);
        }
    }

    public async Task<string> GenerateImageAsync(string prompt)
    {
        try
        {
            var url = "https://api.deepai.org/api/text2img";
            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("text", prompt),
                new KeyValuePair<string, string>("apikey", _apiKey)
            });
            var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = content
            };
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<DeepAIResponse>(responseString);
            return result?.OutputUrl ?? "No image URL found.";
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error generating image for prompt: {Prompt}", prompt);
            throw;
        }
    }
}

public class DeepAIResponse
{
    public string Id { get; set; }
    public string OutputUrl { get; set; }
}

public interface ITextGenerationService
{
    Task<string> GenerateTextAsync(string prompt);
}

public class TextGenerationService : ITextGenerationService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    public TextGenerationService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"];
    }

    public async Task<string> GenerateTextAsync(string prompt)
    {
        try
        {
            Serilog.Log.Error( "this is the prompt :", prompt);

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };
            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();
            string extractedText = null;
            try
            {
                using var doc = JsonDocument.Parse(responseString);
                JsonElement root = doc.RootElement;

                if (root.TryGetProperty("response", out var responseProp) && responseProp.ValueKind == JsonValueKind.String)
                {
                    using var innerDoc = JsonDocument.Parse(responseProp.GetString());
                    extractedText = ExtractTextFromGeminiResponse(innerDoc.RootElement);
                }
                else
                {
                    extractedText = ExtractTextFromGeminiResponse(root);
                }
            }
            catch
            {
                extractedText = responseString;
            }

            return extractedText;
        }
        catch (Exception ex)
        {
            Serilog.Log.Error(ex, "Error generating text for prompt: {Prompt}", prompt);
            throw;
        }
    }

    private string ExtractTextFromGeminiResponse(JsonElement root)
    {
        if (root.TryGetProperty("candidates", out var candidates) &&
            candidates.ValueKind == JsonValueKind.Array &&
            candidates.GetArrayLength() > 0)
        {
            var candidate = candidates[0];
            if (candidate.TryGetProperty("content", out var content) &&
                content.TryGetProperty("parts", out var parts) &&
                parts.ValueKind == JsonValueKind.Array &&
                parts.GetArrayLength() > 0)
            {
                var part = parts[0];
                if (part.TryGetProperty("text", out var textProp))
                {
                    return textProp.GetString();
                }
            }
        }
        return null;
    }
} 