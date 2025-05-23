
using MC.Basic.Application.Models.Calender;
using MC.Basic.Application.Models.Campaign;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Organisation;
using MC.Basic.Application.Models.PlatformConfiguration;
using MC.Basic.Application.Models.Post;
using MC.Basic.Domain;
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
        Task<ApiResponse<ListResponse<List<CampaignListModel>>>> GetCampaigns(ApiRequest<FilteredList> request);
        //Task<ApiResponse<CampaiegnTemplateResponseDto>> GetCampaignsMessageTemplate(ApiRequest<CampaignTemplateRequestDto> request);
        Task<ApiResponse<Campaign>> GetCampaignById(ApiRequest<long> request);
        Task<ApiResponse<CampaignPost>> CreateCampaignPost(ApiRequest<CampaignPost> request);
        Task<ApiResponse<CampaignPost>> CreateCampaignPostFromCampain(long campainId, ApiRequest<CampaignPost> request);
        Task<ApiResponse<List<CampaignPost>>> GetCampaignPosts(ApiRequest<CampaignPost> request);
        Task<ApiResponse<ListResponse<List<CampaignPost>>>> GetCampaignPostsByCampaignId(ApiRequest<FilteredList> request);
        Task<ApiResponse<CampaignPost>> GetCampaignPostById(ApiRequest<long> request);
        Task<ApiResponse<EventContactMessageDto>> GetEventForCampaignPost(ApiRequest<long> request);
        //   Task<ApiResponse<string>> SendBulkMessagetoContacts(ApiRequest<BulkMessageRequest> request);
        Task<ApiResponse<object>> GetMailgunReports(string email, List<string> events);
        Task<ApiResponse<object>> GetMessageinLogs();
        Task<ApiResponse<string>> GetAnswerForQuestion(ApiRequest<string> request);

        // Task<ApiResponse<CampaignWithTemplateDto>> GetEventForCampaign(ApiRequest<long> request);
        // Task<ApiResponse<CampaignMessageTemplates>> GetCampaignsTemplates(ApiRequest<long> request);
        Task<ApiResponse<Organisation>> SuspendOrRecoverOrganisation(ApiRequest<long> request);

        Task<ApiResponse<Organisation>> GetOrgenisationById(ApiRequest<long> request);
        //   Task<ApiResponse<Campaign>> SaveCampaignWithTemplate(ApiRequest<SaveCampaignWithTemplateDto> request);
        Task<ApiResponse<List<ScheduledPostDto>>> GetScheduledPosts(ApiRequest<CalenderPostRequest> request);
        Task<ApiResponse<CampaignPostDto>> GetPostById(ApiRequest<long> request);

        //post email sms whatsapp etc

        Task<ApiResponse<string>> SendCampPost(ApiRequest<CampaignPostRequest> request);
        Task<ApiResponse<PlatformConfigurationViewModel>> GetPlatformConfiguration(ApiRequest<PlatformType> request);
        Task<ApiResponse<string>> UpdatePlatformConfiguration(ApiRequest<PlatformConfigurationDto> request);
    }
}
