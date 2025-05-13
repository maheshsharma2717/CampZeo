using MC.Basic.Application.Models.Mail; 
using Microsoft.Extensions.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Exceptions;
using Twilio.Types;
using Serilog;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.Message;

namespace MC.Basic.Infrastructure.Message // Rename this namespace to something like SMS or Messaging
{
    public class TwilioService : ITwilioService
    {
        private readonly TwilioSettings _twilioSettings;

        public TwilioService(IOptions<TwilioSettings> twilioSettings)
        {
            _twilioSettings = twilioSettings.Value;
            TwilioClient.Init(_twilioSettings.AccountSid, _twilioSettings.AuthToken);
        }

        // Function to send a single SMS message
        public async Task<bool> SendMessage(TwilioMessage message)
        {
            try
            {
                // Send an SMS using Twilio
                var messageSent = MessageResource.Create(
                    body: message.Body, // Message body
                    from: new PhoneNumber(_twilioSettings.FromNumber), // Your Twilio phone number
                    to: new PhoneNumber(message.To) // Recipient phone number
                );

                // Log the status of the message
                if(messageSent.Status == MessageResource.StatusEnum.Queued || messageSent.Status == MessageResource.StatusEnum.Sent || messageSent.Status == MessageResource.StatusEnum.Delivered)
                {
                    Log.Information($"SMS sent successfully to {message.To}, SID: {messageSent.Sid}");
                    return true;
                }
                else
                {
                    Log.Error($"Failed to send SMS to {message.To}. Status: {messageSent.Status}");
                    return false;
                }
            }
            catch(ApiException ex)
            {
                Log.Error($"Error while sending SMS: {ex.Message}");
                return false;
            }
        }

        // Function to send bulk SMS messages
        public async Task<bool> SendBulkMessages(List<TwilioMessage> messages)
        {
            bool allMessagesSent = true;

            foreach(var message in messages)
            {
                bool result = await SendMessage(message);
                if(!result)
                {
                    allMessagesSent = false;
                }
            }

            return allMessagesSent;
        }

        // Function to check the log for a single SMS message by SID
        public Task<MessageLog> CheckLogForSingleMessage(string messageSid)
        {
            try
            {
                // Fetch message details from Twilio by SID
                var message = MessageResource.Fetch(pathSid: messageSid);
                var smsLog = new MessageLog
                {
                    MessageSid = message.Sid,
                    Status = message.Status.ToString(),
                    To = message.To,
                    From = message.From.ToString(),
                    Body = message.Body,
                    DateSent = message.DateSent
                };

                return Task.FromResult(smsLog);
            }
            catch(ApiException ex)
            {
                Log.Error($"Error while fetching log for SMS {messageSid}: {ex.Message}");
                return Task.FromResult<MessageLog>(null);
            }
        }

        // Function to check logs for all SMS messages (for simplicity, fetching latest 10 messages)
        public Task<List<MessageLog>> CheckLogsForAllMessages()
        {
            try
            {
                var messageLogs = new List<MessageLog>();
                var messages = MessageResource.Read(limit: 10); // Fetch the latest 10 messages

                foreach(var message in messages)
                {
                    messageLogs.Add(new MessageLog
                    {
                        MessageSid = message.Sid,
                        Status = message.Status.ToString(),
                        To = message.To,
                        From = message.From.ToString(),
                        Body = message.Body,
                        DateSent = message.DateSent
                    });
                }

                return Task.FromResult(messageLogs);
            }
            catch(ApiException ex)
            {
                Log.Error($"Error while fetching all SMS logs: {ex.Message}");
                return Task.FromResult<List<MessageLog>>(new List<MessageLog>());
            }
        }
    }


}
