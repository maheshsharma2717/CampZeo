using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class Contact:AuditableEntity
    {
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactMobile { get; set; }
        public string ContactWhatsApp { get; set; }

        public long? OrganisationId { get; set; }
        public Organisation Organisation { get; set; }
    }

}
