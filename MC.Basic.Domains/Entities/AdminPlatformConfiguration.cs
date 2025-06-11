using MC.Basic.Domain;
using MC.Basic.Domains.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Domains.Entities
{
    public class AdminPlatformConfiguration:AuditableEntity
    {
        public AdminPlatformConfiguration(){}
        public string? Key { get; set; }
        public string? Value { get; set; }
        public PlatformType Platform { get; set; }

    }
}
