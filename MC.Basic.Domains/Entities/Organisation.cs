using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities {
    public class Organisation : AuditableEntity
    {
        public string Name { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string OwnerName { get; set; }
        public bool IsApproved { get; set; } = false;
        public bool IsDeleted { get; set; } = false;
        public ICollection<User> Users { get; set; }
        public ICollection<Campaign> Campaigns { get; set; }
        public ICollection<Contact> Contacts { get; set; }
    }

}
