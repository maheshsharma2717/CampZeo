using MC.Basic.Application.Models.DataModel;
using RestSharp;
namespace MC.Basic.Application.Contracts.Infrasructure
{

    public interface IMailgunEmailService
    {
        Task<RestResponse> SendMessage(List<string> emails, string template);
        Task<ApiResponse<object>> GetMailgunReports(string emails, List<string> events);
        Task<RestResponse> SendBatchEmail(MailgunEmailParams request);
    }
}