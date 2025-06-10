using MC.Basic.Domains.Entities;

namespace MC.Basic.Application.Contracts.Persistance;

public interface IContactRepository : IAsyncRepository<Contact>
{

    Task<Contact> CreateUpdateContact(Contact contact, long OrganisationId);
    Task<List<Contact>>  GetContactsForOrganisation(long OrganisationId);
    Task<List<Contact>> ImportContact(List<Contact> contact, long OrganisationId);  
}
