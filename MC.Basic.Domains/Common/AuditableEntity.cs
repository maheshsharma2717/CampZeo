using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Common {
    public class AuditableEntity 
    {
        public long Id { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedDate   { get; set; }
        public string? LastModifiedBy { get;set; }
        public DateTime LastModifiedDate { get;set; }

    }
}
