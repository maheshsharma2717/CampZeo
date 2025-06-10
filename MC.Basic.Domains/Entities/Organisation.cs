using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities {
    public class Organisation : AuditableEntity
    {
        public Organisation()
        {
            Users = new List<User>();
            Campaigns = new List<Campaign>();
             Contacts= new List<Contact>();
        }
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string OwnerName { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public ICollection<User> Users { get; set; }
        public ICollection<Campaign> Campaigns { get; set; }
        public ICollection<Contact> Contacts { get; set; }
    }

}
