using MC.Basic.Application.Models.Mail; 
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Exceptions;
using Twilio.Types;
using Serilog;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Twilio;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using RestSharp;
using System.Text.RegularExpressions;
using System.Text;

namespace MC.Basic.Infrastructure.Message // Rename this namespace to something like SMS or Messaging
{
    public class TwilioSmsService : ITwilioService
    {
        private readonly IConfiguration _configuration;
        private readonly string _accountSid;
        private readonly string _authToken;
        private readonly string _twilioNumber;
        private readonly string _twilioWhatsappNumber;
        private readonly string _apiUrl;
        private readonly string _rcsApiUrl;
        private readonly string _serviceSid;

        public TwilioSmsService(IConfiguration configuration)
        {
            _configuration = configuration;
            _accountSid = _configuration.GetRequiredSection("TwilioSettings:accountSid").Value;
            _authToken = _configuration.GetRequiredSection("TwilioSettings:authToken").Value;
            _twilioNumber = _configuration.GetRequiredSection("TwilioSettings:twilioNumber").Value;
            _twilioWhatsappNumber = _configuration.GetRequiredSection("TwilioSettings:twilioWhatsappNumber").Value;
            _apiUrl = _configuration.GetRequiredSection("TwilioSettings:apiUrl").Value;
            _rcsApiUrl = _configuration.GetRequiredSection("TwilioSettings:rcsApiUrl").Value;
            _serviceSid = _configuration.GetRequiredSection("TwilioSettings:serviceSid").Value;
        }
        public async Task<RestResponse> SendMessage(List<string> phoneNumbers, string template)
        {
            var client = new RestClient(_apiUrl);
            var request = new RestRequest($@"2010-04-01/Accounts/{_accountSid}/Messages.json", Method.Post);
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_accountSid}:{_authToken}"));
            request.AddHeader("Authorization", $"Basic {authToken}");

            foreach(var phoneNumber in phoneNumbers)
            {
                request.AddParameter("To", phoneNumber);
                request.AddParameter("From", _twilioNumber);
                request.AddParameter("Body", template);
                var response = await client.ExecuteAsync(request);
            }
            return new RestResponse();
        }

        public async Task<ApiResponse<object>> GetSmsReports(string phoneNumber, List<string> events)
        {
            var client = new RestClient(_apiUrl);
            var request = new RestRequest($"2010-04-01/Accounts/{_accountSid}/Messages.json?To={phoneNumber}", Method.Get);
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_accountSid}:{_authToken}"));
            request.AddHeader("Authorization", $"Basic {authToken}");

            var response = await client.ExecuteAsync(request);
            return new ApiResponse<object> { Data = response.Content };
        }
        //public async Task<RestResponse> SendBatchSms(TwilioSmsParams smsParams)
        //{
        //    var client = new RestClient(_apiUrl);
        //    var request = new RestRequest($@"2010-04-01/Accounts/{_accountSid}/Messages.json", Method.Post);
        //    var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_accountSid}:{_authToken}"));
        //    request.AddHeader("Authorization", $"Basic {authToken}");

        //    request.AddParameter("To", smsParams.PhoneNumber);
        //    request.AddParameter("From", _twilioNumber);
        //    request.AddParameter("Body", smsParams.Message);

        //    var response = await client.ExecuteAsync(request);
        //    return response;
        //}

        public async Task<string> SendBatchSms(TwilioSmsParams smsParams)
        {
            try
            {
                var accountSid = _accountSid;
                var authToken = _authToken;
                TwilioClient.Init(accountSid, authToken);

                StringBuilder logs = new StringBuilder();
                var tasks = new List<Task>();

                foreach(var receiver in smsParams.PhoneNumber)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var message = await MessageResource.CreateAsync(
                            body: smsParams.Message,
                            from: new PhoneNumber(_twilioNumber),
                            to: new PhoneNumber($@"{receiver}")
                        );
                        logs.AppendLine($@"To:{receiver}, Status:{message.Status}");
                    }));
                }

                await Task.WhenAll(tasks);

                return logs.ToString();
            }
            catch(Exception ex)
            {
            }
            return "No data found";
        }

        public async Task<string> SendBatchRcsSms(TwilioMessageParams smsParams)
        {
            try
            {
                var accountSid = _accountSid;
                var authToken = _authToken;
                TwilioClient.Init(accountSid, authToken);

                var messageData = smsParams.Message;
                string base64 = string.Empty;
                string textContent = string.Empty;


                Regex base64Regex = new Regex(@"<img\s+src=""(data:image/[^""]+base64,[^""]+)""");
                MatchCollection base64Matches = base64Regex.Matches(messageData);

                foreach(Match match in base64Matches)
                {
                    if(match.Groups[1].Success)
                    {
                        base64 = match.Groups[1].Value;
                    }
                }

                string cleanText = Regex.Replace(messageData, "<[^>]+?>", "").Trim();

                textContent = cleanText;

                string fileUrl = string.Empty;

                if(!string.IsNullOrEmpty(base64))
                {
                    string[] base64Parts = base64.Split(';');
                    string mimeType = base64Parts[0].Split(':')[1];
                    string extension = mimeType.Split('/')[1];

                    string imageData = base64.Split(',')[1];
                    byte[] imageBytes = Convert.FromBase64String(imageData);
                    string fileName = Guid.NewGuid().ToString() + "." + extension;
                    string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "images", fileName);
                    string directory = Path.GetDirectoryName(imagePath);

                    if(!Directory.Exists(directory))
                    {
                        Directory.CreateDirectory(directory);
                    }

                    File.WriteAllBytes(imagePath, imageBytes);
                    fileUrl = "https://localhost:7163/images/" + fileName;
                }
                StringBuilder logs = new StringBuilder();
                var tasks = new List<Task>();

                foreach(var receiver in smsParams.Recipients)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var createMessageOptions = new CreateMessageOptions(new PhoneNumber($@"{receiver}"))
                        {
                            MediaUrl = new List<Uri> { new Uri("https://5.imimg.com/data5/SELLER/Default/2023/2/KF/XR/TX/75400157/new-product-500x500.jpeg") },

                            //MediaUrl = new List<Uri> { new Uri(fileUrl) },
                            Body = textContent,
                            From = new PhoneNumber(_twilioNumber),
                            SendAsMms = true,


                        };
                        var message = await MessageResource.CreateAsync(
                              createMessageOptions);
                        logs.AppendLine($@"To:{receiver}, Status:{message.Status}");
                    }));
                }

                await Task.WhenAll(tasks);

                return logs.ToString();
            }
            catch(Exception ex)
            {
            }
            return "No data found";
        }

        public async Task<string> SendBatchWhatsappSms(TwilioMessageParams smsParams)
        {
            var accountSid = _accountSid;
            var authToken = _authToken;
            TwilioClient.Init(accountSid, authToken);

            StringBuilder logs = new StringBuilder();
            var tasks = new List<Task>();

            foreach(var receiver in smsParams.Recipients)
            {
                tasks.Add(Task.Run(async () =>
                {
                    var message = await MessageResource.CreateAsync(
                        body: smsParams.Message,
                        from: new PhoneNumber($@"whatsapp:{_twilioWhatsappNumber}"),
                        to: new PhoneNumber($@"whatsapp:{receiver}")
                    );
                    logs.AppendLine($@"To:{receiver}, Status:{message.Status}");
                }));
            }

            await Task.WhenAll(tasks);
            return logs.ToString();
        }


        // Get logs from Twilio
        public async Task<List<LogResponse>> GetLogs()
        {
            var client = new RestClient(_apiUrl);
            var request = new RestRequest($"2010-04-01/Accounts/{_accountSid}/Messages.json", Method.Get);
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_accountSid}:{_authToken}"));
            request.AddHeader("Authorization", $"Basic {authToken}");

            var response = await client.ExecuteAsync(request);

            if(!response.IsSuccessful || string.IsNullOrEmpty(response.Content))
            {
                // Handle or log error here
                return new List<LogResponse>();
            }

            var twilioLogs = JsonConvert.DeserializeObject<TwilioLogResponse>(response.Content);

            var logs = twilioLogs?.Messages?.Select(x => new LogResponse
            {
                Event = x.Status,
                Id = x.Sid,
                Recipient = x.To,
                Timestamp = x.Date_Created.ToString()
            }).ToList() ?? new List<LogResponse>();

            return logs;
        }
    }
}
