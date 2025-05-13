using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Mail;
using MC.Basic.Application.Models.Twilio;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface ITwilioService
    {
        Task<RestResponse> SendMessage(List<string> phoneNumbers, string template);
        Task<ApiResponse<object>> GetSmsReports(string phoneNumber, List<string> events);
        Task<string> SendBatchSms(TwilioSmsParams smsParams);
        Task<List<LogResponse>> GetLogs();
        Task<string> SendBatchRcsSms(TwilioMessageParams smsParams);
        //Task<List<RcsLog>> SendRcsSMS(TwilioMessageParams smsParams);
        //Task<List<RcsLog>> SendRichTextRcsMessage(RcsMessageParams messageParams);
        Task<string> SendBatchWhatsappSms(TwilioMessageParams smsParams);

    }
}
