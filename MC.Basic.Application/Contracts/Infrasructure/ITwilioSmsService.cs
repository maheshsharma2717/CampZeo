using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Twilio;
using RestSharp;

namespace MC.Basic.Application.Contracts.Infrasructure
{

    public interface ITwilioSmsService
    {
        Task<RestResponse> SendMessage(List<string> phoneNumbers, string template);
        Task<ApiResponse<object>> GetSmsReports(string phoneNumber, List<string> events);
        Task<string> SendBatchSms(TwilioSmsParams smsParams);
        Task<List<LogResponse>> GetLogs();
        Task<string> SendBatchRcsSms(Models.DataModel.TwilioMessageParams smsParams);
        //Task<List<RcsLog>> SendRcsSMS(TwilioMessageParams smsParams);
        //Task<List<RcsLog>> SendRichTextRcsMessage(RcsMessageParams messageParams);
        Task<string> SendBatchWhatsappSms(Models.DataModel.TwilioMessageParams smsParams);
    }
}