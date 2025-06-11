using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Twilio;
using MC.Basic.Domains;
using RestSharp;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
namespace MC.Basic.Infrastructure.Mail
{
    public class MailgunEmailService : IMailgunEmailService
    {

        private readonly IPlatformConfigurationRepository _platformConfiguration;
        public MailgunEmailService(IPlatformConfigurationRepository platformConfiguration)
        {
            //The services key gose here
            _platformConfiguration = platformConfiguration;

        }

        public async Task<RestResponse> SendMessage(List<string> emails, string template)
        {
            var domain = await _platformConfiguration.GetConfigurationValueByKey("Domain",PlatformType.Email);
            var fromEmail = await _platformConfiguration.GetConfigurationValueByKey("FromEmail", PlatformType.Email);
            var apiKey = await _platformConfiguration.GetConfigurationValueByKey("ApiKey", PlatformType.Email);

            RestClient client = new RestClient($"https://api.mailgun.net/v3/{domain}/messages");
            var request = new RestRequest();

            // Set API key in header
            var encodedApiKey = Convert.ToBase64String(Encoding.UTF8.GetBytes("api:" + apiKey));
            request.AddHeader("Authorization", "Basic " + encodedApiKey);

            // Email parameters
            request.AddParameter("from", fromEmail);
            request.AddParameter("to", string.Join(",", emails));
            request.AddParameter("subject", "");
            request.AddParameter("html", template);
            request.AddParameter("text", "");
            request.Method = Method.Post;

            // Execute the request and return response
            return await client.ExecuteAsync(request);
        }

        public async Task<ApiResponse<object>> GetMailgunReports(string email, List<string> events)
        {
            var domain = await _platformConfiguration.GetConfigurationValueByKey("Domain", PlatformType.Email);
            var fromEmail = await _platformConfiguration.GetConfigurationValueByKey("FromEmail", PlatformType.Email);
            var apiKey = await _platformConfiguration.GetConfigurationValueByKey("ApiKey", PlatformType.Email);

            using(var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes("api:" + apiKey)));
                var selectedEvents = (string.IsNullOrEmpty(email) ? "" : "recipient =" + email + "&") + (events.Count == 0 ? @$"" : @$"event={string.Join("OR", events)}");
                var apipath = string.IsNullOrEmpty(selectedEvents) ? $@"https://api.mailgun.net/v3/{domain}/events"
                    : $@"https://api.mailgun.net/v3/{domain}/events?{selectedEvents}";
                var response = await client.GetAsync(apipath);
                if(response.IsSuccessStatusCode)
                {
                    var responseData = await response.Content.ReadFromJsonAsync<object>();
                    ApiResponse<object> apiResponse = new ApiResponse<object>()
                    {
                        Data = responseData
                    };
                    return apiResponse;
                }
                else
                {
                    throw new Exception("Error: " + response.StatusCode);
                }
            }
        }
        public async Task<RestResponse> SendBatchEmail(MailgunEmailParams emailParams)
        {
            var domain = await _platformConfiguration.GetConfigurationValueByKey("Domain", PlatformType.Email);
            var fromEmail = await _platformConfiguration.GetConfigurationValueByKey("FromEmail", PlatformType.Email);
            var apiKey = await _platformConfiguration.GetConfigurationValueByKey("ApiKey", PlatformType.Email);
         
            // Create the RestClient
            var client = new RestClient($"https://api.mailgun.net/v3/{domain}/messages");
            var request = new RestRequest();

            // Set Mailgun API key for authentication
            var encodedApiKey = Convert.ToBase64String(Encoding.UTF8.GetBytes("api:" + apiKey));
            request.AddHeader("Authorization", "Basic " + encodedApiKey);

            // Email parameters
            request.AddParameter("from", fromEmail);
            request.AddParameter("to", string.Join(",", emailParams.Recipients));
            request.AddParameter("subject", emailParams.Subject);
            request.AddParameter("html", emailParams.TextBody);

            // Add recipient variables
            var recipientVariablesJson = Newtonsoft.Json.JsonConvert.SerializeObject(emailParams.RecipientVariables);
            request.AddParameter("recipient-variables", recipientVariablesJson, ParameterType.RequestBody);

            // Tracking options
            request.AddParameter("o:tracking", emailParams.Tracking ? "yes" : "no");
            request.AddParameter("o:tracking-clicks", emailParams.TrackingClicks ? "yes" : "no");
            request.AddParameter("o:tracking-opens", emailParams.TrackingOpens ? "yes" : "no");
            request.Method = Method.Post;
            // Execute the request and return the response
            return await client.ExecuteAsync(request);
        }

        public async Task<LogResponse> GetLogs()
        {
            var domain = await _platformConfiguration.GetConfigurationValueByKey("Domain", PlatformType.Email);
            var fromEmail = await _platformConfiguration.GetConfigurationValueByKey("FromEmail", PlatformType.Email);
            var apiKey = await _platformConfiguration.GetConfigurationValueByKey("ApiKey", PlatformType.Email);

            var client = new RestClient("https://api.mailgun.net/v1/analytics/logs");

            var request = new RestRequest();
            request.AddHeader("Authorization", "Basic " + Convert.ToBase64String(System.Text.Encoding.ASCII.GetBytes("api:" + apiKey)));

            var response = await client.ExecuteAsync<LogResponse>(request);

            if(response.IsSuccessful)
            {
                return response.Data;
            }
            else
            {
                throw new HttpRequestException($"Error fetching logs: {response.StatusCode}");
            }
        }
    }
}
