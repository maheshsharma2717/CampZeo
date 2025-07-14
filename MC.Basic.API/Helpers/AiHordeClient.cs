using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;

public class AiHordeClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public AiHordeClient(IConfiguration configuration)
    {
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://stablehorde.net/")
        };
        _apiKey = configuration["AiHorde:ApiKey"];
        _httpClient.DefaultRequestHeaders.Add("apikey", _apiKey);
    }

    public async Task<string> SubmitPromptAsync(string prompt)
    {
        var requestBody = new
        {
            prompt = prompt,
            models = new[] { "Deliberate" },
            @params = new
            {
                sampler_name = "k_euler",
                width = 512,
                height = 512,
                steps = 20,
                cfg_scale = 7,
                n = 4  
            }
        };

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync("api/v2/generate/async", content);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception(responseContent);

        return responseContent;
    }

    public async Task<List<string>> WaitForImagesAsync(string requestId, int maxAttempts = 20, int delay = 3000)
    {
        for (int i = 0; i < maxAttempts; i++)
        {
            await Task.Delay(delay);

            var response = await _httpClient.GetAsync($"api/v2/generate/status/{requestId}");
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception(json);

            var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("done", out var done) && done.GetBoolean())
            {
                var images = doc.RootElement
                    .GetProperty("generations")
                    .EnumerateArray()
                    .Select(x => x.GetProperty("img").GetString())
                    .ToList();

                return images;
            }
        }

        return null;
    }
    public async Task<string> SubmitImageEditAsync(string base64Image, string prompt, string sourceProcessing = "img2img")
    {
        if (!base64Image.StartsWith("data:image/"))
        {
            base64Image = "data:image/png;base64," + base64Image;
        }

        var requestBody = new
        {
            prompt = prompt,
            models = new[] { "deliberate_v2" },
            source_image = base64Image,
            source_processing = sourceProcessing, 
            denoising_strength = 0.5,
            @params = new
            {
                sampler_name = "k_euler",
                width = 512,
                height = 512,
                steps = 30,
                cfg_scale = 7.5
            }
        };

        var json = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        var content = new StringContent(json, Encoding.UTF8, "application/json");

       
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("apikey", _apiKey);
        _httpClient.DefaultRequestHeaders.Add("Client-Agent", "dotnet-client");

        var response = await _httpClient.PostAsync("api/v2/generate/async", content);
        var responseContent = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception(responseContent);

        return responseContent;
    }

    public class EditImageRequest
    {
        public string Prompt { get; set; }
        public string Base64Image { get; set; }
        public string ProcessingType { get; set; } = "img2img"; // or "inpainting"
    }

}
