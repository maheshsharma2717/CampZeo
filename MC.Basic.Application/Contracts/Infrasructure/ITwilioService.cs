using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Mail;
using MC.Basic.Application.Models.Twilio;
using MC.Basic.Domains;
using RestSharp;

namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface ITwilioService
    {
        Task<string> SendBatchSms(TwilioSmsParams smsParams);
        Task<List<LogResponse>> GetLogs(PlatformType platform = PlatformType.SMS);
        Task<string> SendBatchRcsSms(Models.DataModel.TwilioMessageParams smsParams);
        //Task<List<RcsLog>> SendRcsSMS(TwilioMessageParams smsParams);
        //Task<List<RcsLog>> SendRichTextRcsMessage(RcsMessageParams messageParams);
        Task<string> SendBatchWhatsappSms(Models.DataModel.TwilioMessageParams smsParams);

    }
}
