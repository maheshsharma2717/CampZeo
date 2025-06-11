using MC.Basic.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.DataModel
{
    public class OrganisationPlatformRequest
    {
        public long OrganisationId { get; set; }
        public PlatformType Platform { get; set; } // e.g., "LinkedIn", "Facebook", etc.
    }
}
