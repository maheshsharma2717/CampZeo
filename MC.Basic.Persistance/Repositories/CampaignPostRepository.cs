
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace MC.Basic.Persistance.Repositories;

public class CampaignPostRepository:BaseRepository<CampaignPost>, ICampaignPostRepository
{

    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICampaignRepository _campaignRepository;
    BasicDbContext dbcontext;
    public CampaignPostRepository(BasicDbContext context, IHttpContextAccessor httpContextAccessor, ICampaignRepository campaignRepository) : base(context)
    {
        dbcontext = context;
        _httpContextAccessor = httpContextAccessor;
        _campaignRepository = campaignRepository;
    }
    //public async Task<CampaignPost> CreateUpdateMessageTemplate(CampaignPost messageTemplate,long OrganisationId)
    //{
    //    var dbOrganisation = await dbcontext.Organizations.Include(x => x).SingleOrDefaultAsync(x => x.Id == OrganisationId);
    //    if(dbOrganisation != null)
    //    {
    //        var dbMessageTemplate = dbOrganisation.CampaignsPost.SingleOrDefault(x => x.Id == messageTemplate.Id);
    //        if(dbMessageTemplate == null)
    //        {
    //            dbOrganisation.Campaigns.Add(messageTemplate);
    //            dbMessageTemplate = messageTemplate;
    //        }
    //        else
    //        {
    //            dbMessageTemplate.LastModifiedById = messageTemplate.LastModifiedById;
    //            dbMessageTemplate.DateModified = messageTemplate.DateModified;
    //            dbMessageTemplate.Subject = messageTemplate.Subject;
    //            dbMessageTemplate.Message = messageTemplate.Message;
    //            dbMessageTemplate.SenderEmail = messageTemplate.SenderEmail;
    //            dbMessageTemplate.OrganisationName = messageTemplate.OrganisationName;
    //            dbMessageTemplate.Type = messageTemplate.Type;
    //            dbMessageTemplate.IsAttachedToCampaign = messageTemplate.IsAttachedToCampaign;
    //            dbMessageTemplate.CampainId = messageTemplate.CampainId;
    //            dbMessageTemplate.VideoUrl = messageTemplate.VideoUrl;
    //            dbMessageTemplate.ScheduledPostTime = messageTemplate.ScheduledPostTime;
    //            dbMessageTemplate = await UpdateAsync(dbMessageTemplate);
    //        }
    //        await dbcontext.SaveChangesAsync();
    //        return dbMessageTemplate;
    //    }
    //    else
    //    {
    //        throw new Exception("You are not member of any Organisation");
    //    }
    //}
    public async Task<CampaignPost> CreateUpdateMessageTemplate(CampaignPost campaignPost)
    {

        var campaign = await _campaignRepository.GetRecordWithIncludes(x=>x.CampaignPost,x=>x.Id==campaignPost.CampaignId );
        if(campaign == null)
            throw new Exception("Campaign not found in your organisation");

        if(campaignPost.ScheduledPostTime < campaign.StartDate || campaignPost.ScheduledPostTime > campaign.EndDate)
            throw new Exception(
                $"Scheduled post time ({campaignPost.ScheduledPostTime:yyyy-MM-dd HH:mm}) is outside the campaign period " +
                $"({campaign.StartDate:yyyy-MM-dd HH:mm} to {campaign.EndDate:yyyy-MM-dd HH:mm})"
            );
        var dbCampaignPost = campaign.CampaignPost.SingleOrDefault(p => p.Id == campaignPost.Id);

        if(dbCampaignPost == null)
        {
            // New post
            campaign.CampaignPost.Add(campaignPost);
            dbCampaignPost = campaignPost;
        }
        else
        {
            // Update existing post
            dbCampaignPost.LastModifiedBy = campaignPost.LastModifiedBy;
            dbCampaignPost.LastModifiedDate = campaignPost.LastModifiedDate;
            dbCampaignPost.Subject = campaignPost.Subject;
            dbCampaignPost.Message = campaignPost.Message;
            dbCampaignPost.SenderEmail = campaignPost.SenderEmail;
           // dbMessageTemplate.OrganisationName = messageTemplate.OrganisationName;
            dbCampaignPost.Type = campaignPost.Type;
            dbCampaignPost.IsAttachedToCampaign = campaignPost.IsAttachedToCampaign;
            dbCampaignPost.CampaignId = campaignPost.CampaignId;
            dbCampaignPost.VideoUrl = campaignPost.VideoUrl;
            dbCampaignPost.ScheduledPostTime = campaignPost.ScheduledPostTime;

            dbcontext.CampaignPosts.Update(dbCampaignPost); // Optional if using tracking
        }

        await dbcontext.SaveChangesAsync();
        return dbCampaignPost;
    }

    public async Task<List<CampaignPost>> GetMessageTemplatesForOrganisation(long OrganisationId)
    {
        var organisation = await dbcontext.Organizations
            .Include(x => x.Campaigns)
                .ThenInclude(c => c.CampaignPost)
            .SingleOrDefaultAsync(x => x.Id == OrganisationId);

        if(organisation == null)
            throw new Exception("You are not member of any Organisation");

        return organisation.Campaigns
            .SelectMany(c => c.CampaignPost)
            .OrderByDescending(p => p.Id)
            .ToList();
    }


}
