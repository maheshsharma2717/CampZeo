
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace MC.Basic.Persistance.Repositories;

public class CampaignPostRepository:BaseRepository<CampaignPost>, ICampaignPostRepository
{

    private readonly IHttpContextAccessor _httpContextAccessor;
    BasicDbContext dbcontext;
    public CampaignPostRepository(BasicDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
    {
        dbcontext = context;
        _httpContextAccessor = httpContextAccessor;
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
    public async Task<CampaignPost> CreateUpdateMessageTemplate(CampaignPost messageTemplate, long OrganisationId)
    {
        var dbOrganisation = await dbcontext.Organizations.Include(o => o.Campaigns)
                .ThenInclude(c => c.CampaignPost)
            .SingleOrDefaultAsync(o => o.Id == OrganisationId);

        if(dbOrganisation == null)
            throw new Exception("You are not member of any Organisation");

        var campaign = dbOrganisation.Campaigns.FirstOrDefault(c => c.Id == messageTemplate.CampaignId);

        if(campaign == null)
            throw new Exception("Campaign not found in your organisation");

        var dbMessageTemplate = campaign.CampaignPost.FirstOrDefault(p => p.Id == messageTemplate.Id);

        if(dbMessageTemplate == null)
        {
            // New post
            campaign.CampaignPost.Add(messageTemplate);
            dbMessageTemplate = messageTemplate;
        }
        else
        {
            // Update existing post
            dbMessageTemplate.LastModifiedBy = messageTemplate.LastModifiedBy;
            dbMessageTemplate.LastModifiedDate = messageTemplate.LastModifiedDate;
            dbMessageTemplate.Subject = messageTemplate.Subject;
            dbMessageTemplate.Message = messageTemplate.Message;
            dbMessageTemplate.SenderEmail = messageTemplate.SenderEmail;
           // dbMessageTemplate.OrganisationName = messageTemplate.OrganisationName;
            dbMessageTemplate.Type = messageTemplate.Type;
            dbMessageTemplate.IsAttachedToCampaign = messageTemplate.IsAttachedToCampaign;
            dbMessageTemplate.CampaignId = messageTemplate.CampaignId;
            dbMessageTemplate.VideoUrl = messageTemplate.VideoUrl;
            dbMessageTemplate.ScheduledPostTime = messageTemplate.ScheduledPostTime;

            dbcontext.CampaignPosts.Update(dbMessageTemplate); // Optional if using tracking
        }

        await dbcontext.SaveChangesAsync();
        return dbMessageTemplate;
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
