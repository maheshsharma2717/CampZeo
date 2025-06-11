using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance.Repositories
{
    public class OrganizationRepository : BaseRepository<Organisation>, IOrganisationRepository
    {
        public OrganizationRepository(BasicDbContext dbContext) : base(dbContext) { }
        public async Task<Organisation> CreateOrUpdate(Organisation organisation)
        {
            var dbOrganisation = await GetRecordWithIncludes(org => org.OrganisationPlatform ,org => org.Id == organisation.Id);
            if(dbOrganisation == null)
            {
                dbOrganisation = await CreateAsync(organisation);
            }
            else
            {
                dbOrganisation.Id = organisation.Id;
                dbOrganisation.CreatedBy = organisation.CreatedBy;
                dbOrganisation.LastModifiedBy = organisation.LastModifiedBy;
                dbOrganisation.CreatedDate = organisation.CreatedDate;
                dbOrganisation.LastModifiedDate = organisation.LastModifiedDate;
                dbOrganisation.Name = organisation.Name;
                dbOrganisation.Phone = organisation.Phone;
                dbOrganisation.Email = organisation.Email;
                dbOrganisation.Address = organisation.Address;
                dbOrganisation.City = organisation.City;
                dbOrganisation.State = organisation.State;
                dbOrganisation.Country = organisation.Country;
                dbOrganisation.PostalCode = organisation.PostalCode;
                if(dbOrganisation.OrganisationPlatform != null && organisation.OrganisationPlatform != null)
                {
                    foreach(var platform in organisation.OrganisationPlatform)
                    {
                        var existingPlatform = dbOrganisation.OrganisationPlatform
                            .FirstOrDefault(p => p.Platform == platform.Platform);

                        if(existingPlatform == null)
                        {
                            dbOrganisation.OrganisationPlatform.Add(platform);
                        }
                        else
                        {
                            existingPlatform.Platform = platform.Platform;
                        }
                    }

                    var platformsToRemove = dbOrganisation.OrganisationPlatform
                        .Where(p => !organisation.OrganisationPlatform.Any(op => op.Platform == p.Platform))
                        .ToList();

                    foreach(var platformToRemove in platformsToRemove)
                    {
                        dbOrganisation.OrganisationPlatform.Remove(platformToRemove);
                    }
                }

                dbOrganisation = await UpdateAsync(dbOrganisation);
            }
            return dbOrganisation;
        }
        public async Task<Organisation> ApproveOrganisation(long id)
        {
            var dbOrganisation = await GetQuariable().SingleOrDefaultAsync(org => org.Id == id && !org.IsApproved);
            if(dbOrganisation != null)
            {
                dbOrganisation.IsApproved = true;
                dbOrganisation = await UpdateAsync(dbOrganisation);

                return dbOrganisation;
            }
            else
            {
                throw new Exception("Invalid Organisation");
            }
        }
        public async Task<Organisation> SuspendOrRecoverOrganisation(long id)
        {
            var dbOrganisation = await GetQuariable().SingleOrDefaultAsync(org => org.Id == id);
            if(dbOrganisation != null)
            {
                dbOrganisation.IsDeleted = !dbOrganisation.IsDeleted;
                dbOrganisation.IsApproved = false;
                dbOrganisation = await UpdateAsync(dbOrganisation);
                return dbOrganisation;
            }
            else
            {
                throw new Exception("Invalid Organisation");
            }
        }


        public Task<bool> IsOrganizationNameUnique(string? name)
        {
            var matches = _dbContext.Organizations.Any(e => e.Name == name);
            return Task.FromResult(matches);
        }
        public async Task<User> CreateOrganisationUser(Organisation dbOrganisation, string password)
        {
            try
            {
                var orgUser = new User
                {
                    
                    Email = dbOrganisation.Email,
                    Password = password,
                    IsApproved = dbOrganisation.IsApproved,
                    OrganisationId = dbOrganisation.Id
                };
                dbOrganisation.Users.Add(orgUser);
                await UpdateAsync(dbOrganisation);
                return orgUser;
            }
            catch(Exception)
            {

                throw;
            }
        }

        public async Task<Organisation> GetOrganisationByOrganisationId(long orgId)
        {
            try
            {
                var dbOrganisation = await GetRecordWithIncludes(org => org.OrganisationPlatform, org => org.Id == orgId && !org.IsDeleted);
                if (dbOrganisation == null)
                {
                    throw new Exception("Invalid Organisation");
                }
                return dbOrganisation;
            }
            catch(Exception ex)
            {
                throw;
            }
        }
    }
}
