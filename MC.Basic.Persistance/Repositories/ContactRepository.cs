
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Domains.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace MC.Basic.Persistance.Repositories
{
    public class ContactRepository : BaseRepository<Contact>, IContactRepository
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        BasicDbContext dbcontext;
        public ContactRepository(BasicDbContext dbContext, IHttpContextAccessor httpContextAccessor) : base(dbContext)
        {
            dbcontext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Contact> CreateUpdateContact(Contact contact, long OrganisationId)
        {
            var dbOrganisation = await dbcontext.Organizations.Include(x => x.Contacts).SingleOrDefaultAsync(x => x.Id == OrganisationId);
            if(dbOrganisation != null)
            {
                var dbContact = dbOrganisation.Contacts.SingleOrDefault(x => x.Id == contact.Id);
                if(dbContact == null)
                {
                    if(dbOrganisation.Contacts.Any(x => x.ContactEmail == contact.ContactEmail)) throw new Exception("This email already Exists");
                    dbOrganisation.Contacts.Add(contact);
                    dbContact = contact;
                }
                else
                {
                    if(dbOrganisation.Contacts.Any(x => x.ContactEmail == contact.ContactEmail && contact.ContactEmail!=dbContact.ContactEmail)) throw new Exception("This email already Exists");
                    dbContact.LastModifiedBy = contact.LastModifiedBy;
                    dbContact.CreatedDate = contact.CreatedDate;
                    dbContact.ContactEmail = contact.ContactEmail;
                    dbContact.ContactName = contact.ContactName;
                    dbContact.ContactEmail = contact.ContactEmail;
                    dbContact.ContactMobile = contact.ContactMobile;
                    dbContact.ContactWhatsApp = contact.ContactWhatsApp;
                    dbContact = await UpdateAsync(dbContact);
                }
                await dbcontext.SaveChangesAsync();
                return dbContact;
            }
            else
            {
                throw new Exception("You are not member of any Organisation");
            }
        }

        public async Task<List<Contact>> ImportContact(List<Contact> contact,long OrganisationId)
        {
            var dbOrganisation = await dbcontext.Organizations.Include(x => x.Contacts).SingleOrDefaultAsync(x => x.Id == OrganisationId);
            if(dbOrganisation != null)
            {
                List<Contact> contacts = new List<Contact>();

                foreach(var contactItem in contact)
                {
                    var dbContact = dbOrganisation.Contacts.SingleOrDefault(x => x.ContactEmail == contactItem.ContactEmail);

                    if(dbContact == null)
                    {
                        dbOrganisation.Contacts.Add(contactItem);
                        contacts.Add(contactItem);
                    }
                    else
                    {
                        dbContact.LastModifiedBy = contactItem.LastModifiedBy;
                        dbContact.CreatedDate = DateTime.Now;
                        dbContact.ContactEmail = contactItem.ContactEmail;
                        dbContact.ContactName = contactItem.ContactName;
                        dbContact.ContactMobile = contactItem.ContactMobile;
                        dbContact.ContactWhatsApp = contactItem.ContactWhatsApp;
                        contacts.Add(await UpdateAsync(dbContact));
                    }
                    await dbcontext.SaveChangesAsync();
                }

                return contacts;
            }
            else
            {
                throw new Exception("You are not member of any Organisation");
            }
        }
        public async Task<List<Contact>> GetContactsForOrganisation(long OrganisationId)
        {
            var organisation = await dbcontext.Organizations.Include(x => x.Contacts).SingleOrDefaultAsync(x => x.Id == OrganisationId);
            if(organisation != null)
            {
                return organisation.Contacts
                     .OrderByDescending(x => x.Id) 
            .ToList(); 
            }
            else
            {
                throw new Exception("You are not member of any Organisation");
            }
        }
    }
}
