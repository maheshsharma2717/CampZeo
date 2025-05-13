using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.Authorization
{
    public class JwtSettings
    {
        public string? Secret { get; set; }
        public string? Issuer { get; set; }
        public string? Audience { get; set; }
        public string? ExpiryMinutes { get; set; }

    }
}
