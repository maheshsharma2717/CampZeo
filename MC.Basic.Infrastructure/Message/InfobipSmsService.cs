using RestSharp;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;

public class InfobipSmsService : IInfobipSmsService
{
    private readonly string _baseUrl = "https://z3vw92.api.infobip.com/rcs/2/messages";
    private readonly string _apiKey = "483a09785424a81da14715f516bbf0e2-2ad0ab26-e125-47a5-9953-bfa20fdccb21";
    private readonly RestClient _client;

    public InfobipSmsService()
    {
        var options = new RestClientOptions(_baseUrl)
        {
            MaxTimeout = -1
        };
        _client = new RestClient(options);
    }
    public class WhatsAppMessageParams
    {
        public List<string> Recipients { get; set; }
        public string Sender { get; set; }
        public string Message { get; set; }
        public string TemplateName { get; set; }
        public List<string> TemplatePlaceholders { get; set; }
        public string Language { get; set; } = "en";
        public string MediaUrl { get; set; }
    }

    public async Task<RestResponse> SendWhatsAppMessageAsync(WhatsAppMessageParams messageParams)
    {
        var messages = messageParams.Recipients.Select(phone => new
        {
            from = messageParams.Sender,
            to = phone,
            messageId = Guid.NewGuid().ToString(),
            content = string.IsNullOrEmpty(messageParams.TemplateName) ? (dynamic)new { text = messageParams.Message } : (dynamic)new
            {
                templateName = messageParams.TemplateName,
                templateData = new
                {
                    body = new
                    {
                        placeholders = messageParams.TemplatePlaceholders
                    }
                },
                language = messageParams.Language
            }
        });

        var body = new { messages };

        var request = new RestRequest("/whatsapp/1/message/template", Method.Post);

        request.AddHeader("Authorization", $"App {_apiKey}");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Accept", "application/json");
        request.AddStringBody(JsonConvert.SerializeObject(body), DataFormat.Json);

        return await _client.ExecuteAsync(request);
    }


    public async Task<RestResponse> SendTextMessageAsync(InfobipMessageParams messageParams)
    {
        var messages = messageParams.Recipients.Select(phone => new
        {
            sender = "447860099299",
            destinations = new[] { new { to = phone } },
            content = new
            {
                text = messageParams.Message,
                type = "TEXT"
            }
        });

        var body = new { messages };

        var request = CreateRequest(body);
        return await _client.ExecuteAsync(request);
    }


    public async Task<RestResponse> SendMediaMessageAsync(InfobipMessageParams messageParams)
    {

        var messageData = messageParams.Message;
        string base64 = string.Empty;
        string textContent = string.Empty;


        Regex base64Regex = new Regex(@"<img\s+src=""(data:image/[^""]+base64,[^""]+)""");
        MatchCollection base64Matches = base64Regex.Matches(messageData);

        foreach (Match match in base64Matches)
        {
            if (match.Groups[1].Success)
            {
                base64 = match.Groups[1].Value;
            }
        }

        string cleanText = Regex.Replace(messageData, "<[^>]+?>", "").Trim();

        textContent = cleanText;

        string fileUrl = string.Empty;

        if (!string.IsNullOrEmpty(base64))
        {
            string[] base64Parts = base64.Split(';');
            string mimeType = base64Parts[0].Split(':')[1];
            messageParams.MediaType = mimeType;
            string extension = mimeType.Split('/')[1];

            string imageData = base64.Split(',')[1];
            byte[] imageBytes = Convert.FromBase64String(imageData);
            string fileName = Guid.NewGuid().ToString() + "." + extension;
            string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "images", fileName);
            string directory = Path.GetDirectoryName(imagePath);

            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllBytes(imagePath, imageBytes);
            fileUrl = "https://localhost:7163/images/" + fileName;
        }
        var messages = messageParams.Recipients.Select(phone => new
        {
            sender = "447860099299",

            destinations = new[] { new { to = phone } },
            content = new
            {
                text = messageParams.Message,
                type = messageParams.MediaType?.ToUpper(),
                file = string.IsNullOrEmpty(fileUrl) ? null : new { url = messageParams.MediaUrl }
            }
        });

        var body = new { messages };

        var request = CreateRequest(body);
        return await _client.ExecuteAsync(request);
    }

    private RestRequest CreateRequest(object body)
    {
        var request = new RestRequest
        {
            Method = Method.Post
        };

        request.AddHeader("Authorization", $"App {_apiKey}");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Accept", "application/json");
        request.AddStringBody(JsonConvert.SerializeObject(body), DataFormat.Json);

        return request;
    }

}
