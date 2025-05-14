
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Organisation;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Http;

namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface IApplicationService
    {

        Task<ApiResponse<Organisation>> ApproveOrganisation(ApiRequest<long> request);
//Todo
      //  Task<ApiResponse<string>> SelectOrganisation(ApiRequest<long> request);
        Task<ApiResponse<Organisation>> CreateOrganisation(ApiRequest<OrganisationCreateDto> request);
        Task<ApiResponse<ListResponse<List<Organisation>>>> GetOrganisation(ApiRequest<FilteredList> request);
        Task<ApiResponse<User>> UpdateUser(ApiRequest<User> request);
        Task<ApiResponse<List<Contact>>> ImportContact(ApiRequest<IFormFile> file);
        Task<ApiResponse<List<Contact>>> GetContacts(ApiRequest<Contact> request);
        Task<ApiResponse<Contact>> CreateContact(ApiRequest<Contact> request);
        Task<ApiResponse<Contact>> GetContactById(ApiRequest<long> request);
        Task<ApiResponse<Campaign>> CreateCampaign(ApiRequest<Campaign> request);
      //  Task<ApiResponse<bool>> CreateCampaignMessageTemplate(ApiRequest<CampaignMessageTemplateDto> request);
        Task<ApiResponse<List<Campaign>>> GetCampaigns(ApiRequest<Campaign> request);
        //Task<ApiResponse<CampaignTemplateResponseDto>> GetCampaignsMessageTemplate(ApiRequest<CampaignTemplateRequestDto> request);
        Task<ApiResponse<Campaign>> GetCampaignById(ApiRequest<long> request);  
        Task<ApiResponse<CampaignPost>> CreateMessageTemplate(ApiRequest<CampaignPost> request);
        Task<ApiResponse<CampaignPost>> CreateMessageTemplateFromCampain(long campainId, ApiRequest<CampaignPost> request);
        Task<ApiResponse<List<CampaignPost>>> GetMessageTemplates(ApiRequest<CampaignPost> request);
        Task<ApiResponse<CampaignPost>> GetMessageTemplateById(ApiRequest<long> request);
     //   Task<ApiResponse<EventContactMessageDto>> GetEventForCampaign(ApiRequest<long> request);
     //   Task<ApiResponse<string>> SendBulkMessagetoContacts(ApiRequest<BulkMessageRequest> request);
        Task<ApiResponse<object>> GetMailgunReports(string email, List<string> events);
        Task<ApiResponse<object>> GetMessageinLogs();
        Task<ApiResponse<string>> GetAnswerForQuestion(ApiRequest<string> request);

       // Task<ApiResponse<CampaignWithTemplateDto>> GetEventForCampaign(ApiRequest<long> request);
       // Task<ApiResponse<CampaignMessageTemplates>> GetCampaignsTemplates(ApiRequest<long> request);
        Task<ApiResponse<Organisation>> SuspendOrRecoverOrganisation(ApiRequest<long> request);

        Task<ApiResponse<Organisation>> GetOrgenisationById(ApiRequest<long> request);
     //   Task<ApiResponse<Campaign>> SaveCampaignWithTemplate(ApiRequest<SaveCampaignWithTemplateDto> request);
     //   Task<ApiResponse<List<ScheduledPostDto>>> GetScheduledPosts(ApiRequest<long?> request);
      //  Task<ApiResponse<MessageTemplateDto>> GetTemplateById(ApiRequest<TemplateLookupDto> request);

    }
}
