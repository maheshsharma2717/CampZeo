
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;


namespace MC.Basic.Persistance.Repositories;

public class CampaignRepository : BaseRepository<Campaign>, ICampaignRepository
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    BasicDbContext dbcontext;
    public CampaignRepository(BasicDbContext context, IHttpContextAccessor httpContextAccessor) : base(context)
    {
        dbcontext = context;
        _httpContextAccessor = httpContextAccessor;
    }
    public async Task<Campaign> CreateUpdateCampaign(Campaign campaign, long OrganisationId)
    {
        var dbOrganisation = await dbcontext.Organizations.Include(x => x.Campaigns).SingleOrDefaultAsync(x => x.Id == OrganisationId);
        if (dbOrganisation != null)
        {
            var dbCampaign = dbOrganisation.Campaigns.SingleOrDefault(x => x.Id == campaign.Id);
            if (dbCampaign == null)
            {
                dbOrganisation.Campaigns.Add(campaign);
                dbCampaign = campaign;
            }
            else
            {
                dbCampaign.LastModifiedBy = campaign.LastModifiedBy;
                dbCampaign.LastModifiedDate = campaign.LastModifiedDate;
                dbCampaign.Name = campaign.Name;
                dbCampaign.Description = campaign.Description;
                dbCampaign.StartDate = campaign.StartDate;
                dbCampaign.EndDate = campaign.EndDate;
                dbCampaign.IsEmailCampaign = campaign.IsEmailCampaign;
                dbCampaign.IsWhatsAppCampaign = campaign.IsWhatsAppCampaign;
                dbCampaign.IsSmsCampaign = campaign.IsSmsCampaign;
                dbCampaign.IsRCSCampaign = campaign.IsRCSCampaign;
                dbCampaign.IsFacebookCampaign = campaign.IsFacebookCampaign;
                dbCampaign.IsInstagramCampaign = campaign.IsInstagramCampaign;
                dbCampaign = await UpdateAsync(dbCampaign);
            }
            await dbcontext.SaveChangesAsync();
            return dbCampaign;
        }
        else
        {
            throw new Exception("You are not member of any Organisation");
        }
    }

    public async Task<List<Campaign>> GetCampaignsForOrganisation(long OrganisationId)
    {
        var organisation = await dbcontext.Organizations.Include(x => x.Campaigns).SingleOrDefaultAsync(x => x.Id == OrganisationId);
        if (organisation != null)
        {
            return (List<Campaign>)organisation.Campaigns;
        }
        else
        {
            throw new Exception("You are not member of any Organisation");
        }
    }

    //public async task<campaign> getcampaignsformessagetemplate(long id)
    //{
    //    var campaignmessage = await dbcontext.campaigns.include(x => x.campaignmessagetemplates).singleordefaultasync(x => x.id == id);
    //    if (campaignmessage != null)
    //    {
    //        return campaignmessage;
    //    }
    //    else
    //    {
    //        throw new exception("something went wrong");
    //    }
    //}

    //public async Task<CampaignMessageTemplates> GetCampaignsMessageTemplateWithIncludes(long Id)
    //{
    //    var campaignmessage = await Context.CampaignMessageTemplates
    //        .Include(x => x.WhatsappTemplate)
    //        .Include(x => x.SmsTemplate)
    //        .Include(x => x.RcsTemplate)
    //        .Include(x => x.EmailTemplate)
    //        .Include(x => x.FacebookTemplate)
    //        .Include(x => x.InstagramTemplate)
    //        .SingleOrDefaultAsync(x => x.Id == Id);
    //    if (campaignmessage != null)
    //    {
    //        return campaignmessage;
    //    }
    //    else
    //    {
    //        throw new Exception("Something went wrong");
    //    }
    //}
    public async Task<List<Campaign>> GetCampaignsByIds(List<long?> campaignIds)
    {
        return await dbcontext.Campaigns
            .Where(c => campaignIds.Contains(c.Id))
            .ToListAsync();
    }

}
