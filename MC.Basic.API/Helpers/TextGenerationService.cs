using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

public interface ITextGenerationService
{
    Task<string> GenerateTextAsync(string prompt, string model = "gemini-1.5-flash");
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

    public async Task<string> GenerateTextAsync(string prompt, string model = "gemini-1.5-flash")
    {
        // Gemini expects a POST to /v1beta/models/{model}:generateContent?key=API_KEY
        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={_apiKey}";
        var requestBody = new
        {
            contents = new[]
            {
                new {
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
        // Try to extract the generated text from the response
        var json = JsonNode.Parse(responseString);
        var text = json?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString();
        return text ?? responseString;
    }
} 