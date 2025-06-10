using MC.Basic.Application.Contracts.Infrasructure;
using RestSharp;

namespace CampaignManagement.AI.Intigration.Service;

public class GeminiService:IGeminiService
{
    private readonly string _apiKey = "AIzaSyD45Mjf3kmAL4J8IQUD0vQaZnkBT28Luyk";
    public async Task<string> TestPrompt(string prompt)
    {

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={_apiKey}";

        var client = new RestClient(url);
        var request = new RestRequest();
        request.Method = Method.Post;
        request.AddHeader("Content-Type", "application/json");

        var body = new
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

        request.AddJsonBody(body);

        try
        {
            var response = await client.ExecuteAsync(request);
            if (response.IsSuccessful)
            {
                return response.Content;
            }
            else
            {
                return "Request failed:" + response.ErrorMessage;
            }
        }
        catch (Exception ex)
        {
            return "An error occurred:" + ex.Message;
        }
    }
}
