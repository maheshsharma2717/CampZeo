using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.DataModel;
using MC.Basic.Application.Models.Organisation;
using MC.Basic.Application.Models.Post;
using MC.Basic.Application.Models.Twilio;
using MC.Basic.Domain;
using MC.Basic.Domains.Entities;
using MC.Basic.Infrastructure.Message;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;

namespace MC.Basic.Infrastructure.Services;
public class ApplicationService : IApplicationService
{
    private readonly IOrganisationRepository _organisationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly IContactRepository _contactRepository;
    private readonly ICampaignRepository _campaignRepository;
   // private readonly ICampaignMessageTemplateRepository _campaignMessageTemplateRepository;
    private readonly ICampaignPostRepository _messageTemplateRepository;
    private readonly ICampaignPostRepository _campaignPostRepository;
    private readonly string passwordKey;
    private readonly IMailgunEmailService _mailgunService;
    private readonly ITwilioService _smsService;
    private readonly IInfobipSmsService _infoBipSmsService;
    private readonly IGeminiService _aIService;
    #region Constructor
    public ApplicationService(IOrganisationRepository organisationRepository,
        IUserRepository userRepository,
        IEmailService emailService,
        ICampaignRepository campaignRepository,
        IContactRepository contactRepository,
        ICampaignPostRepository campaignPostRepository,
        IGeminiService AIService,
        ITwilioService smsService,
        IInfobipSmsService infoBipSmsService,
        IMailgunEmailService mailgunService
       // ICampaignMessageTemplateRepository campaignMessageTemplateRepository
        )
    {
        _organisationRepository = organisationRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _contactRepository = contactRepository;
        _campaignRepository = campaignRepository;
        _campaignPostRepository = _campaignPostRepository;
        passwordKey = "b14ca5898a4e4133bbce2ea2315a1917";
        _mailgunService = mailgunService;
        _smsService = smsService;
        _infoBipSmsService = infoBipSmsService;
        _aIService = AIService;
       // _campaignMessageTemplateRepository = campaignMessageTemplateRepository;
    }
    #endregion
    #region Organisation 
    public async Task<ApiResponse<Organisation>> CreateOrganisation(ApiRequest<OrganisationCreateDto> request)
    {
        // Map DTO to entity
        var organisation = new Organisation
        {
            Name = request.Data.Name,
            Phone = request.Data.Phone,
            Email = request.Data.Email,
            Address = request.Data.Address,
            OwnerName = request.Data.OwnerName,
            Users = new List<User>(),
            Campaigns = new List<Campaign>(),
            Contacts = new List<Contact>()
        };

        var savedOrganisation = await _organisationRepository.CreateOrUpdate(organisation);

        // Build response
        var response = new ApiResponse<Organisation>
        {
            IsSuccess = true,
            Data = savedOrganisation
        };

        return response;
    }

    public async Task<ApiResponse<Organisation>> ApproveOrganisation(ApiRequest<long> request)
    {
        ApiResponse<Organisation> response = new ApiResponse<Organisation>();
        var organisationId = request.Data;
        var dbOrganisation = await _organisationRepository.ApproveOrganisation(request.Data);
        var password = GenerateRandomPassword(12);
        var user = await _organisationRepository.CreateOrganisationUser(dbOrganisation, EncryptString(passwordKey, password));
        await _emailService.SendPasswordToUserEmail(user.Email, password);
        //send email
        response.IsSuccess = true;
        return response;
    }

    public async Task<ApiResponse<Organisation>> SuspendOrRecoverOrganisation(ApiRequest<long> request)
    {
        ApiResponse<Organisation> response = new ApiResponse<Organisation>();
        var organisationId = request.Data;
        var dbOrganisation = await _organisationRepository.SuspendOrRecoverOrganisation(request.Data);
        var message = $@"
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset=""UTF-8"">
                <title>Account Suspension Notice</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        color: #333;
                        background-color: #f9f9f9;
                        padding: 20px;
                    }}
                    .email-container {{
                        max-width: 600px;
                        margin: auto;
                        background-color: #ffffff;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 30px;
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 20px;
                    }}
                    .header h2 {{
                        color: #d9534f;
                    }}
                    .content p {{
                        line-height: 1.6;
                    }}
                    .footer {{
                        margin-top: 30px;
                        font-size: 14px;
                        color: #777;
                        text-align: center;
                    }}
                    .button {{
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #0275d8;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                    }}
                </style>
            </head>
            <body>
                <div class=""email-container"">
                    <div class=""header"">
                        <h2>Account Suspension Notice</h2>
                    </div>
                    <div class=""content"">
                        <p>Hi <strong>{dbOrganisation.OwnerName}</strong>,</p>
                        <p>We regret to inform you that your Campzeo account (<strong>{dbOrganisation.Email}</strong>) has been temporarily suspended as of <strong>{DateTime.Now:dd-MM-yyyy HH:mm}</strong>.</p>
                        <p>If you believe this was a mistake or would like to appeal this decision, please reach out to our support team.</p>
                        <p>You can contact us at: <a href=""mailto:office@mandavconsultancy.com"">office@mandavconsultancy.com</a></p>
                        <a class=""button"" href=""mailto:office@mandavconsultancy.com"">Contact Support</a>
                        <p>We value your relationship with Campzeo and are here to help resolve this matter as quickly as possible.</p>
                        <p>Thank you for your understanding,</p>
                        <p><strong>The Campzeo Team</strong></p>
                    </div>
                    <div class=""footer"">
                        &copy; {DateTime.Now:yyyy} Campzeo. All rights reserved.
                    </div>
                </div>
            </body>
            </html>";
        if (dbOrganisation.IsDeleted)message = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"">
    <title>Account Reinstated</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            color: #333;
            background-color: #f4f4f4;
            padding: 20px;
        }}
        .email-container {{
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 30px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 20px;
        }}
        .header h2 {{
            color: #28a745;
        }}
        .content p {{
            line-height: 1.6;
        }}
        .footer {{
            margin-top: 30px;
            font-size: 14px;
            color: #777;
            text-align: center;
        }}
        .button {{
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }}
    </style>
</head>
<body>
    <div class=""email-container"">
        <div class=""header"">
            <h2>Account Reinstated</h2>
        </div>
        <div class=""content"">
            <p>Hi <strong>{dbOrganisation.OwnerName}</strong>,</p>
            <p>We’re pleased to inform you that your Campzeo account (<strong>{dbOrganisation.Email}</strong>) has been successfully reinstated as of <strong>{DateTime.Now:dd-MM-yyyy HH:mm}</strong>.</p>
            <p>You now have full access to your account and services again.</p>
            <p>If you have any questions or need further assistance, feel free to contact us at 
                <a href=""mailto:office@mandavconsultancy.com"">office@mandavconsultancy.com</a>.
            </p>
            <a class=""button"" href=""https://campzeo.com/login"">Go to Dashboard</a>
            <p>Thank you for your continued trust in Campzeo.</p>
            <p><strong>The Campzeo Team</strong></p>
        </div>
        <div class=""footer"">
            &copy; {DateTime.Now:yyyy} Campzeo. All rights reserved.
        </div>
    </div>
</body>
</html>";


        await _emailService.SendEmailMessage(dbOrganisation.Email, message);
        return response;
    }
    public async Task<ApiResponse<ListResponse<List<Organisation>>>> GetOrganisation(ApiRequest<FilteredList> request)
    {
        var response = new ApiResponse<ListResponse<List<Organisation>>>();

        Expression<Func<Organisation, bool>> filter = c => true;

        if (request.Data.IsDeleted != null)
            filter = c => c.IsDeleted == request.Data.IsDeleted;

        response.Data = await _organisationRepository.GetPagedRecords(
            filter,
            request.Data.PageSize,
            request.Data.PageNumber,
            request.Data.SearchText,
            request.Data.SortBy,
            request.Data.SortDesc
        );

        response.IsSuccess = true;
        return response;
    }

    #endregion
    #region User
    public async Task<ApiResponse<User>> UpdateUser(ApiRequest<User> request)
    {
        ApiResponse<User> response = new ApiResponse<User>();
        response.Data = await _userRepository.CreateUpdateUser(request.Data);
        response.IsSuccess = true;
        return response;
    }

    #endregion
    #region Contacts
    public async Task<ApiResponse<List<Contact>>> GetContacts(ApiRequest<Contact> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<List<Contact>> response = new ApiResponse<List<Contact>>();
        if (OrganizationId == 0)
        {
            response.Data = new List<Contact>();
            response.IsSuccess = false;
            response.Message = "No Contacts found";
        }
        else
        {
            response.Data = await _contactRepository.GetContactsForOrganisation(OrganizationId);
            response.IsSuccess = true;
            response.Message = "";
        }

        return response;
    }

    public async Task<ApiResponse<List<Contact>>> ImportContact(ApiRequest<IFormFile> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<List<Contact>> response = new ApiResponse<List<Contact>>();
        var csvContacts = GetContactsFromCsv(request.Data);
        response.Data = await _contactRepository.ImportContact(csvContacts, OrganizationId);
        return response;
    }
    public async Task<ApiResponse<Contact>> CreateContact(ApiRequest<Contact> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<Contact> response = new ApiResponse<Contact>();
        var dbContact = await _contactRepository.CreateUpdateContact(request.Data, OrganizationId);
        return response;
    }
    public async Task<ApiResponse<Contact>> GetContactById(ApiRequest<long> request)
    {
        return new ApiResponse<Contact> { Data = await _contactRepository.GetById(request.Data) };
    }

    #endregion
    #region Campaign
    public async Task<ApiResponse<Campaign>> CreateCampaign(ApiRequest<Campaign> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<Campaign> response = new ApiResponse<Campaign>
        {
            Data = await _campaignRepository.CreateUpdateCampaign(request.Data, OrganizationId)
        };
        return response;
    }

    //public async Task<ApiResponse<bool>> CreateCampaignMessageTemplate(ApiRequest<CampaignMessageTemplateDto> request)
    //{
    //    ApiResponse<bool> response = new ApiResponse<bool> { Data = false };
    //    var OrganisationId = GetOrganisationIdFromToken(request.Token);
    //    var dbCampaign = await _campaignRepository.GetCampaignsForMessageTemplate(request.Data.CampaignId);
    //    if (dbCampaign.CampaignMessageTemplates == null)
    //    {
    //        dbCampaign.CampaignMessageTemplates = new CampaignMessageTemplates();
    //    }
    //    long templateId = request.Data.TemplateId ?? 0;
    //    switch (request.Data.Type)
    //    {

    //        case (TemplateType.WhatsApp):
    //            {
    //                dbCampaign.CampaignMessageTemplates.WhatsappTemplate = await _messageTemplateRepository.GetById(templateId);
    //                response.Data = true;
    //                break;
    //            }
    //        case (TemplateType.Email):
    //            {
    //                dbCampaign.CampaignMessageTemplates.EmailTemplate = await _messageTemplateRepository.GetById(templateId);
    //                response.Data = true;
    //                break;
    //            }
    //        case (TemplateType.SMS):
    //            {
    //                dbCampaign.CampaignMessageTemplates.SmsTemplate = await _messageTemplateRepository.GetById(templateId);
    //                response.Data = true;
    //                break;
    //            }
    //        case (TemplateType.RCS):
    //            {
    //                dbCampaign.CampaignMessageTemplates.RcsTemplate = await _messageTemplateRepository.GetById(templateId);
    //                response.Data = true;
    //                break;
    //            }
    //        case (TemplateType.Facebook):
    //            {
    //                dbCampaign.CampaignMessageTemplates.FacebookTemplate = await _messageTemplateRepository.GetById(templateId);
    //                response.Data = true;
    //                break;
    //            }
    //        case (TemplateType.Instagram):
    //            {
    //                dbCampaign.CampaignMessageTemplates.InstagramTemplate = await _messageTemplateRepository.GetById(templateId);
    //                response.Data = true;
    //                break;
    //            }
    //    }
    //    await _campaignRepository.CreateUpdateCampaign(dbCampaign, OrganisationId);
    //    return response;
    //}

    public async Task<ApiResponse<List<Campaign>>> GetCampaigns(ApiRequest<Campaign> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        var dbOrg = await _organisationRepository.GetQuariable().Include(x => x.Campaigns).SingleOrDefaultAsync(x => x.Id == OrganizationId);
        ApiResponse<List<Campaign>> response = new ApiResponse<List<Campaign>>();
        if (dbOrg != null)
        {
            response.Data = dbOrg.Campaigns.OrderByDescending(c => c.Id).ToList();
            response.IsSuccess = true;
            response.Message = "";
        }
        else
        {
            response.Data = new List<Campaign>();
            response.IsSuccess = false;
            response.Message = "No campaigns found";
        }
        return response;
    }


    //public async Task<ApiResponse<CampaignMessageTemplates>> GetCampaignsTemplates(ApiRequest<long> request)
    //{
    //    var dbCampaign = await _campaignRepository.GetQuariable().Include(x => x.CampaignMessageTemplates).SingleOrDefaultAsync(x => x.Id == request.Data);
    //    ApiResponse<CampaignMessageTemplates> response = new ApiResponse<CampaignMessageTemplates>
    //    {

    //        Data = dbCampaign != null ? dbCampaign.CampaignMessageTemplates : new CampaignMessageTemplates(),
    //    };
    //    return response;
    //}

    //public async Task<ApiResponse<CampaignWithTemplateDto>> GetEventForCampaign(ApiRequest<long> request)
    //{
    //    var OrganizationId = GetOrganisationIdFromToken(request.Token);
    //    var response = new ApiResponse<CampaignWithTemplateDto>();

    //    var dbcampaign = await _campaignRepository.GetCampaignsForMessageTemplate(request.Data);
    //    var org = _organisationRepository.GetQuariable().Include(x => x.Contacts).SingleOrDefault(x => x.Id == OrganizationId);
    //    var contacts = org.Contacts;
    //    if (dbcampaign != null)
    //    {
    //        if (dbcampaign.CampaignMessageTemplates != null)
    //        {
    //            var tmepId = dbcampaign.CampaignMessageTemplates.Id;
    //            var dbTemp = await _campaignMessageTemplateRepository.GetCampaignsMessageTemplates(tmepId);
    //            response.Data = new CampaignWithTemplateDto
    //            {
    //                Campaign = dbcampaign,
    //                CampaignMessageTemplate = dbTemp,
    //                Contact = contacts
    //            };
    //        }
    //    }
    //    else
    //    {
    //        response.Message = "Campaign not found.";
    //        response.IsSuccess = false;
    //    }

    //    return response;
    //}
    public async Task<ApiResponse<Campaign>> GetCampaignById(ApiRequest<long> request)
    {
        return new ApiResponse<Campaign> { Data = await _campaignRepository.GetById(request.Data) };
    }
    #endregion
    #region MessageTemplate
    public async Task<ApiResponse<CampaignPost>> CreateCampaignPost(ApiRequest<CampaignPost> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<CampaignPost> response = new ApiResponse<CampaignPost>
        {
            Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId)
        };
        return response;
    }

    public async Task<ApiResponse<CampaignPost>> CreateCampaignPostFromCampain(long campainId, ApiRequest<CampaignPost> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);

        ApiResponse<CampaignPost> response = new ApiResponse<CampaignPost>();
        if (campainId == request.Data.CampaignId)
        {

            response.Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId);

        }
        else
        {
            var removePrevious = _messageTemplateRepository.GetQuariable().Where(x => x.CampaignId == campainId && x.Type == request.Data.Type).FirstOrDefault();
            if (removePrevious != null)
            {
                removePrevious.CampaignId = null;
                removePrevious.IsAttachedToCampaign = false;
                await _messageTemplateRepository.UpdateAsync(removePrevious);
            }

            if (request.Data.CampaignId == null)
            {
                request.Data.CampaignId = campainId;
                request.Data.IsAttachedToCampaign = true;
                response.Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId);

                //ApiRequest<CampaignMessageTemplateDto> requestToAdd = new ApiRequest<CampaignMessageTemplateDto>();
                //; CampaignMessageTemplateDto campaignMessageTemplateDto = new CampaignMessageTemplateDto();
                //campaignMessageTemplateDto.CampaignId = campainId;
                //campaignMessageTemplateDto.TemplateId = response.Data.Id;
                //campaignMessageTemplateDto.Type = response.Data.Type;
                //requestToAdd.Data = campaignMessageTemplateDto;
                //requestToAdd.Token = request.Token;
                //await CreateCampaignMessageTemplate(requestToAdd);

            }
            else
            {

                request.Data.Id = 0;
                request.Data.CampaignId = campainId;
                response.Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId);

                //ApiRequest<CampaignMessageTemplateDto> requestToAdd = new ApiRequest<CampaignMessageTemplateDto>();
                //; CampaignMessageTemplateDto campaignMessageTemplateDto = new CampaignMessageTemplateDto();
                //campaignMessageTemplateDto.CampaignId = campainId;
                //campaignMessageTemplateDto.TemplateId = response.Data.Id;
                //campaignMessageTemplateDto.Type = response.Data.Type;
                //requestToAdd.Data = campaignMessageTemplateDto;
                //requestToAdd.Token = request.Token;
                //await CreateCampaignMessageTemplate(requestToAdd);
            }

            // 

            //return response;

        }

        ////var getAllCampaign = await _campaignRepository.GetCampaignsForOrganisation(OrganizationId);

        //var getCampaign = await _campaignRepository.GetCampaignsForMessageTemplate(campainId);
        //var getCampaignMsgTemp = await _campaignMessageTemplateRepository.GetCampaignsMessageTemplates(getCampaign.CampaignMessageTemplates.Id);

        //long NewId = 0;
        //if(request.Data.Type == TemplateType.Email)
        //{
        //    NewId = getCampaignMsgTemp.EmailTemplate.Id;
        //}
        //if (request.Data.Type == TemplateType.SMS)
        //{
        //    NewId = getCampaignMsgTemp.SmsTemplate.Id;
        //}
        //if (request.Data.Type == TemplateType.WhatsApp)
        //{
        //    NewId = getCampaignMsgTemp.WhatsappTemplate.Id;
        //}
        //if (request.Data.Type == TemplateType.RCS)
        //{
        //    NewId = getCampaignMsgTemp.RcsTemplate.Id;
        //}
        //ApiResponse<MessageTemplate> response = new ApiResponse<MessageTemplate>();

        //if (NewId == 0)
        //{
        //    // need to check the template exit in other campain

        // //   var findCampain = 

        //    // need to bind the template to campaign


        //    response.Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId);
        //}
        //else
        //{
        //    if (NewId == request.Data.Id)
        //    {
        //        response.Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId);
        //    }
        //    else
        //    {
        //        request.Data.Id = 0;
        //        response.Data = await _messageTemplateRepository.CreateUpdateMessageTemplate(request.Data, OrganizationId);
        //    }
        //}

        return response;
    }


    public async Task<ApiResponse<List<CampaignPost>>> GetCampaignPosts(ApiRequest<CampaignPost> request)
    {

        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<List<CampaignPost>> response = new ApiResponse<List<CampaignPost>>();
        if (OrganizationId == 0)
        {
            response.Data = new List<CampaignPost>();
            response.IsSuccess = false;
            response.Message = "No Message Template found";
        }
        else
        {
            response.Data = await _messageTemplateRepository.GetMessageTemplatesForOrganisation(OrganizationId);
            response.IsSuccess = true;
            response.Message = "";
        }
        return response;
    }



    public async Task<ApiResponse<CampaignPost>> GetCampaignPostById(ApiRequest<long> request)
    {
        return new ApiResponse<CampaignPost> { Data = await _messageTemplateRepository.GetById(request.Data) };
    }

    //public async Task<ApiResponse<CampaignTemplateResponseDto>> GetCampaignsMessageTemplate(ApiRequest<CampaignTemplateRequestDto> request)
    //{
    //    var OrganizationId = GetOrganisationIdFromToken(request.Token);
    //    var dbMessageTemplates = await _messageTemplateRepository.GetMessageTemplatesForOrganisation(OrganizationId);
    //    var messageTemplates = dbMessageTemplates.Where(x => x.Type == request.Data.TemplateType).ToList();
    //    var allTemplatesForCampaign = await _campaignRepository.GetQuariable().Include(x => x.CampaignMessageTemplates).SingleOrDefaultAsync(x => x.Id == request.Data.CampaignId);
    //    long selectedId = 0;
    //    if (allTemplatesForCampaign != null)
    //    {
    //        switch (request.Data.TemplateType)
    //        {

    //            case (TemplateType.WhatsApp):
    //                {
    //                    selectedId = (allTemplatesForCampaign.CampaignMessageTemplates != null && allTemplatesForCampaign.CampaignMessageTemplates.WhatsappTemplate != null) ? allTemplatesForCampaign.CampaignMessageTemplates.WhatsappTemplate.Id : 0;
    //                    break;
    //                }
    //            case (TemplateType.Email):
    //                {
    //                    selectedId = (allTemplatesForCampaign.CampaignMessageTemplates != null && allTemplatesForCampaign.CampaignMessageTemplates.EmailTemplate != null) ? allTemplatesForCampaign.CampaignMessageTemplates.EmailTemplate.Id : 0;
    //                    break;
    //                }
    //            case (TemplateType.SMS):
    //                {
    //                    selectedId = (allTemplatesForCampaign.CampaignMessageTemplates != null && allTemplatesForCampaign.CampaignMessageTemplates.SmsTemplate != null) ? allTemplatesForCampaign.CampaignMessageTemplates.SmsTemplate.Id : 0;
    //                    break;
    //                }
    //            case (TemplateType.RCS):
    //                {
    //                    selectedId = (allTemplatesForCampaign.CampaignMessageTemplates != null && allTemplatesForCampaign.CampaignMessageTemplates.RcsTemplate != null) ? allTemplatesForCampaign.CampaignMessageTemplates.RcsTemplate.Id : 0;
    //                    break;
    //                }
    //            case (TemplateType.Facebook):
    //                {
    //                    selectedId = (allTemplatesForCampaign.CampaignMessageTemplates != null && allTemplatesForCampaign.CampaignMessageTemplates.FacebookTemplate != null) ? allTemplatesForCampaign.CampaignMessageTemplates.FacebookTemplate.Id : 0;
    //                    break;
    //                }
    //            case (TemplateType.Instagram):
    //                {
    //                    selectedId = (allTemplatesForCampaign.CampaignMessageTemplates != null && allTemplatesForCampaign.CampaignMessageTemplates.InstagramTemplate != null) ? allTemplatesForCampaign.CampaignMessageTemplates.InstagramTemplate.Id : 0;
    //                    break;
    //                }
    //        }
    //    }

    //    ApiResponse<CampaignTemplateResponseDto> res = new ApiResponse<CampaignTemplateResponseDto>
    //    {
    //        Data = new CampaignTemplateResponseDto
    //        {
    //            MessageTemplates = messageTemplates,
    //            SelectedTemplateId = selectedId
    //        }
    //    };
    //    return res;
    //}

    #endregion
    #region Logs 
    public async Task<ApiResponse<object>> GetMailgunReports(string email, List<string> events)
    {
        return await _mailgunService.GetMailgunReports(email, events);
    }
    public async Task<ApiResponse<object>> GetMessageinLogs()
    {
        var response = new ApiResponse<object>
        {
            Data = await _smsService.GetLogs()
        };
        return response;
    }
    #endregion
    #region Messaging
    //public async Task<ApiResponse<string>> SendBulkMessagetoContacts(ApiRequest<BulkMessageRequest> request)
    //{
    //    var campaign = await _campaignRepository.GetQuariable().Include(x => x.CampaignMessageTemplates).SingleOrDefaultAsync(x => x.Id == request.Data.CampaignId);

    //    var campaignMessagetemplate = await _campaignRepository.GetCampaignsMessageTemplateWithIncludes(campaign.CampaignMessageTemplates.Id);
    //    if (campaign == null)
    //    {
    //        return new ApiResponse<string> { Data = "Message template not found." };
    //    }
    //    StringBuilder sb = new StringBuilder();
    //    if (campaign.CampaignMessageTemplates != null && campaign.CampaignMessageTemplates.EmailTemplate != null)
    //    {
    //        sb.AppendLine(await SendMail(request.Data.Contacts, campaign.CampaignMessageTemplates.EmailTemplate));
    //    }
    //    if (campaign.CampaignMessageTemplates != null && campaign.CampaignMessageTemplates.WhatsappTemplate != null)
    //    {
    //        sb.AppendLine(await SendWhatsapp(request.Data.Contacts, campaign.CampaignMessageTemplates.WhatsappTemplate));
    //    }
    //    if (campaign.CampaignMessageTemplates != null && campaign.CampaignMessageTemplates.SmsTemplate != null)
    //    {
    //        sb.AppendLine(await SendSms(request.Data.Contacts, campaign.CampaignMessageTemplates.SmsTemplate));
    //    }
    //    if (campaign.CampaignMessageTemplates != null && campaign.CampaignMessageTemplates.RcsTemplate != null)
    //    {
    //        sb.AppendLine(await SendRcs(request.Data.Contacts, campaign.CampaignMessageTemplates.RcsTemplate));
    //    }

    //    else
    //    {
    //        return new ApiResponse<string> { Data = "Unsupported message type." };
    //    }

    //    return new ApiResponse<string> { Data = "Messages Send Successfully", IsSuccess = true };
    //}
    public async Task<ApiResponse<Organisation>> GetOrgenisationById(ApiRequest<long> request)
    {
        var OrganizationId = GetOrganisationIdFromToken(request.Token);
        ApiResponse<Organisation> response = new ApiResponse<Organisation>();
        response.Data = await _organisationRepository.GetById(OrganizationId);
        response.IsSuccess = true;
        return response;
    }


    #endregion  
    #region AI Intigration
    public async Task<ApiResponse<string>> GetAnswerForQuestion(ApiRequest<string> request)
    {
        var prompt = request.Data;
        var stringData = await _aIService.TestPrompt(prompt);
        return new ApiResponse<string>()
        {
            Data = stringData
        };
    }

    #endregion
    #region Private Functions
    private static string GenerateRandomPassword(int length)
    {
        const string upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowerChars = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string specialChars = "!@#$%^&*()_-+=<>?";
        string allChars = upperChars + lowerChars + digits + specialChars;
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        password.Append(upperChars[random.Next(upperChars.Length)]);
        password.Append(lowerChars[random.Next(lowerChars.Length)]);
        password.Append(digits[random.Next(digits.Length)]);
        password.Append(specialChars[random.Next(specialChars.Length)]);
        for (int i = 4; i < length; i++)
        {
            password.Append(allChars[random.Next(allChars.Length)]);
        }
        char[] passwordArray = password.ToString().ToCharArray();
        ShuffleArray(passwordArray);
        return new string(passwordArray);
    }
    private static void ShuffleArray(char[] array)
    {
        Random random = new Random();
        for (int i = array.Length - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            // Swap
            char temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    private string EncryptString(string key, string plainText)
    {
        byte[] iv = new byte[16];
        byte[] array;

        using (Aes aes = Aes.Create())
        {
            aes.Key = Encoding.UTF8.GetBytes(key);
            aes.IV = iv;

            ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

            using (MemoryStream memoryStream = new MemoryStream())
            {
                using (CryptoStream cryptoStream = new CryptoStream((Stream)memoryStream, encryptor, CryptoStreamMode.Write))
                {
                    using (StreamWriter streamWriter = new StreamWriter((Stream)cryptoStream))
                    {
                        streamWriter.Write(plainText);
                    }

                    array = memoryStream.ToArray();
                }
            }
        }

        return Convert.ToBase64String(array);
    }
    private List<Contact> GetContactsFromCsv(IFormFile file)
    {
        using (var stream = new StreamReader(file.OpenReadStream()))
        {
            // You can use CsvHelper or similar to process the CSV file.
            var contacts = new List<Contact>();
            using (var csv = new CsvHelper.CsvReader(stream, CultureInfo.InvariantCulture))
            {

                //skip headers
                csv.Context.RegisterClassMap<ContactCsvMap>();

                // Read the records and map them to the Contact class
                contacts = csv.GetRecords<Contact>().Select(contact =>
                new Contact
                {
                    CreatedBy = contact.CreatedBy,
                    LastModifiedBy = contact.LastModifiedBy,
                    CreatedDate = DateTime.Now,
                    LastModifiedDate = DateTime.Now,
                    ContactName = contact.ContactName,
                    ContactEmail = contact.ContactEmail,
                    ContactMobile = contact.ContactMobile,
                    ContactWhatsApp = contact.ContactWhatsApp,
                }).ToList();
            }

            return contacts.Skip(1).ToList();
        }
    }
    private long GetOrganisationIdFromToken(string token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return 0; // Return 0 if the token is invalid or empty
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (jwtToken == null)
            {
                return 0; // Return 0 if token can't be read as JwtSecurityToken
            }

            // Extract the organisationId claim from the token
            var organisationIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "organisationId");

            if (organisationIdClaim != null && long.TryParse(organisationIdClaim.Value, out var organisationId))
            {
                return organisationId;
            }

            return 0; // Return 0 if organisationId claim is not found or invalid
        }
        catch
        {
            // Return 0 in case of any errors (token invalid, claim not present, etc.)
            return 0;
        }
    }
    private string GetHtmlFromFullMessage(string message)
    {
        var set = message.Split("[{(break)}]");
        return set[0];
    }

    private async Task<string> SendMail(List<Contact> contacts, CampaignPost messageTemplate)
    {
        var recipients = contacts.Select(x => x.ContactEmail).ToList();
        var recipientVariables = contacts.ToDictionary(
            x => x.ContactEmail,
            x => new Dictionary<string, object> { { "name", x.ContactName }, { "phone", x.ContactMobile } });

        var emailParams = new MailgunEmailParams
        {
            Recipients = recipients,
            Subject = "Hey %recipient.name%",
            TextBody = GetHtmlFromFullMessage(messageTemplate.Message),
            RecipientVariables = recipientVariables,
            Tracking = true,
            TrackingClicks = true,
            TrackingOpens = true
        };

        var response = await _mailgunService.SendBatchEmail(emailParams);
        return response.IsSuccessful
            ? "Emails sent successfully!"
            : response.Content;

    }

    private async Task<string> SendWhatsapp(List<Contact> contacts, CampaignPost messageTemplate)
    {
        var recipients = contacts.Select(x => x.ContactWhatsApp).ToList();
        if (messageTemplate != null && recipients.Any())
        {
            var result = await _smsService.SendBatchWhatsappSms(new Application.Models.DataModel.TwilioMessageParams(recipients, messageTemplate.Message));
            return result;
        }
        return "No recipients for WhatsApp or invalid message template.";

    }


    private async Task<string> SendSms(List<Contact> contacts, CampaignPost messageTemplate)
    {
        var recipients = contacts.Select(x => x.ContactMobile).ToList();
        if (messageTemplate != null && recipients.Any())
        {
            var result = await _smsService.SendBatchSms(new TwilioSmsParams(recipients, messageTemplate.Message));
            return result;
        }
        return "No recipients for SMS or invalid message template.";

    }


    private async Task<string> SendRcs(List<Contact> contacts, CampaignPost messageTemplate)
    {
        var message = messageTemplate.Message;

        var recipients = contacts
            .Where(x => !string.IsNullOrEmpty(x.ContactMobile))
            .Select(x => x.ContactMobile)
            .ToList();

        if (!recipients.Any())
        {
            return "No valid recipients found.";
        }

        try
        {
            var result = await _infoBipSmsService.SendMediaMessageAsync(new Application.Models.DataModel.InfobipMessageParams(recipients, messageTemplate.Message));
            return $"RCS messages sent successfully. ";
        }
        catch (Exception ex)
        {
            return $"Failed to send RCS messages: {ex.Message}";
        }
    }

    #endregion

    public async Task<ApiResponse<Campaign>> SaveCampaignWithTemplate(ApiRequest<SaveCampaignWithTemplateDto> request)
    {
        var organisationId = GetOrganisationIdFromToken(request.Token);

        var campaign = new Campaign
        {
            Id = request.Data.Id,
            Name = request.Data.Name,
            Description = request.Data.Description,
            StartDate = request.Data.StartDate,
            EndDate = request.Data.EndDate,
        };

        var savedCampaign = await _campaignRepository.CreateUpdateCampaign(campaign, organisationId);

        foreach (var templateDto in request.Data.CampaignMessageTemplates)
        {
            if (templateDto.ScheduledPostTime < savedCampaign.StartDate || templateDto.ScheduledPostTime > savedCampaign.EndDate)
            {
                return new ApiResponse<Campaign>
                {
                    IsSuccess = false,
                    Message = "The scheduled post time must be between the campaign start and end date."
                };
            }
        }
        var campaignMessageTemplates = new CampaignPost();
        foreach (var templateDto in request.Data.CampaignMessageTemplates)
        {
            if (templateDto.ScheduledPostTime < savedCampaign.StartDate ||
                templateDto.ScheduledPostTime > savedCampaign.EndDate)
                continue;

            var messageTemplate = new CampaignPost
            {
                Subject = templateDto.Subject,
                Message = templateDto.Message,
                SenderEmail = templateDto.SenderEmail,
               // OrganisationName = templateDto.OrganisationName,
                Type = (PlatformType)templateDto.Type,
                VideoUrl = templateDto.VideoUrl,
                IsAttachedToCampaign = true,
                CampaignId = savedCampaign.Id,
               // OrganisationId = organisationId,
                ScheduledPostTime = templateDto.ScheduledPostTime,
                // Add other fields like LastModifiedById if applicable
            };

            await _messageTemplateRepository.CreateUpdateMessageTemplate(messageTemplate, organisationId);
        }


        savedCampaign.CampaignPost = (ICollection<CampaignPost>)campaignMessageTemplates;

        var finalCampaign = await _campaignRepository.CreateUpdateCampaign(savedCampaign, organisationId);

        return new ApiResponse<Campaign> { Data = finalCampaign };
    }

    public async Task<ApiResponse<List<ScheduledPostDto>>> GetScheduledPosts(ApiRequest<long?> request)
    {
        var organisationId = GetOrganisationIdFromToken(request.Token);
        var campaignId = request.Data;

        var templates = await _messageTemplateRepository.GetMessageTemplatesForOrganisation(organisationId);

        var filteredTemplates = templates
            .Where(t => t.IsAttachedToCampaign && t.ScheduledPostTime.HasValue)
            .Where(t => !campaignId.HasValue || t.CampaignId == campaignId.Value)
            .ToList();

        var campaignIds = filteredTemplates.Select(t => t.CampaignId).Distinct().ToList();
        var campaigns = await _campaignRepository.GetCampaignsByIds(campaignIds);

        var result = filteredTemplates.Select(t =>
        {
            var campaign = campaigns.FirstOrDefault(c => c.Id == t.CampaignId);
            return new ScheduledPostDto
            {
                TemplateId = t.Id,
                CampaignId = t.CampaignId ?? 0,
                CampaignName = campaign?.Name,
                TemplateType = t.Type,
                ScheduledPostTime = t.ScheduledPostTime.Value,
                Message = t.Message
            };
        }).ToList();

        return new ApiResponse<List<ScheduledPostDto>>
        {
            Data = result,
            IsSuccess = true
        };
    }

    public async Task<ApiResponse<CampaignPostDto>> GetTemplateById(ApiRequest<TemplateLookupDto> request)
    {
        var organisationId = GetOrganisationIdFromToken(request.Token);
        var templateId = request.Data.TemplateId;
        var type = request.Data.Type;

        var template = await _messageTemplateRepository.GetById(templateId);

        if (template == null || template.Type != (PlatformType)type )
        {
            return new ApiResponse<CampaignPostDto>
            {
                IsSuccess = false,
                Message = "Template not found or not accessible."
            };
        }
        var result = new CampaignPostDto
        {
            Type = (int)template.Type,
            Message = template.Message,
            VideoUrl = template.VideoUrl,
            ScheduledPostTime = template.ScheduledPostTime,
            Subject = template.Subject,
            SenderEmail = template.SenderEmail,
        };

        return new ApiResponse<CampaignPostDto>
        {
            Data = result,
            IsSuccess = true
        };
    }

}


