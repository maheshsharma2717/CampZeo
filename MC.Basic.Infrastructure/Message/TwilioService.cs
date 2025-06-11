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
using System.Collections.Concurrent;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domain;

namespace MC.Basic.Infrastructure.Message 
{
    public class TwilioService : ITwilioService
    {
        private readonly IConfiguration _configuration;
        private readonly IPlatformConfigurationRepository _platformConfigurationRepository;
        private readonly string _apiUrl;

        public TwilioService(IConfiguration configuration, IPlatformConfigurationRepository platformConfigurationRepository)
        {
            _configuration = configuration;
            _platformConfigurationRepository = platformConfigurationRepository;
            _apiUrl = _configuration.GetRequiredSection("TwilioSettings:apiUrl").Value;

        }

        public async Task<string> SendBatchSms(TwilioSmsParams smsParams)
        {
            try
            {
                var accountSid = await _platformConfigurationRepository.GetConfigurationValueByKey("accountSid", PlatformType.SMS);
                var authToken = await _platformConfigurationRepository.GetConfigurationValueByKey("authToken", PlatformType.SMS);
                var twilioNumber = await _platformConfigurationRepository.GetConfigurationValueByKey("twilioNumber", PlatformType.SMS);
                TwilioClient.Init(accountSid, authToken);

                StringBuilder logs = new StringBuilder();
                var tasks = new List<Task>();

                foreach(var receiver in smsParams.PhoneNumber)
                {
                    tasks.Add(Task.Run(async () =>
                    {
                        var message = await MessageResource.CreateAsync(
                            body: smsParams.Message,
                            from: new PhoneNumber(twilioNumber),
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

        public async Task<string> SendBatchRcsSms(Application.Models.DataModel.TwilioMessageParams smsParams)
        {
            try
            {
                var accountSid = await _platformConfigurationRepository.GetConfigurationValueByKey("accountSid", PlatformType.RCS);
                var authToken = await _platformConfigurationRepository.GetConfigurationValueByKey("authToken", PlatformType.RCS);
                var twilioWhatsappNumber = await _platformConfigurationRepository.GetConfigurationValueByKey("twilioWhatsappNumber", PlatformType.RCS);

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
                            From = new PhoneNumber(twilioWhatsappNumber),
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

        public async Task<string> SendBatchWhatsappSms(Application.Models.DataModel.TwilioMessageParams smsParams)
        {
            var accountSid = await _platformConfigurationRepository.GetConfigurationValueByKey("accountSid", PlatformType.WhatsApp);
            var authToken = await _platformConfigurationRepository.GetConfigurationValueByKey("authToken", PlatformType.WhatsApp);
            var twilioNumber = await _platformConfigurationRepository.GetConfigurationValueByKey("twilioNumber", PlatformType.WhatsApp);

            TwilioClient.Init(accountSid, authToken);

            var logs = new ConcurrentBag<string>(); // Thread-safe
            var tasks = smsParams.Recipients.Select(async receiver =>
            {
                try
                {
                    var message = await MessageResource.CreateAsync(
                        body: smsParams.Message,
                        from: new PhoneNumber($"whatsapp:{twilioNumber}"),
                        to: new PhoneNumber($"whatsapp:{receiver}")
                    );

                    logs.Add($"To: {receiver}, Status: {message.Status}");
                }
                catch (Exception ex)
                {
                    logs.Add($"To: {receiver}, Error: {ex.Message}");
                }
            });

            await Task.WhenAll(tasks);

            return string.Join(Environment.NewLine, logs);
        }



        // Get logs from Twilio
        public async Task<List<LogResponse>> GetLogs(PlatformType platform = PlatformType.SMS)
        {
            var _accountSid = await _platformConfigurationRepository.GetConfigurationValueByKey("accountSid", platform);
            var _authToken = await _platformConfigurationRepository.GetConfigurationValueByKey("authToken", platform);

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
