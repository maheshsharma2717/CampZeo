using CsvHelper.Configuration;
using MC.Basic.Domains.Entities;

namespace MC.Basic.Application.Models.DataModel;
public class ContactCsvMap : ClassMap<Contact>
{
    public ContactCsvMap()
    {
        // Map CSV columns to the Contact model properties
        Map(m => m.ContactName).Name("Name");
        Map(m => m.ContactEmail).Name("Email");
        Map(m => m.ContactMobile).Name("Phone");
        Map(m => m.ContactWhatsApp).Name("WhatsApp");
    }
}