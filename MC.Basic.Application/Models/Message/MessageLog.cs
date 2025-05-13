using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.Message
{
    public class MessageLog
    {
        public string MessageSid { get; set; }
        public string Status { get; set; }
        public string To { get; set; }
        public string From { get; set; }
        public string Body { get; set; }
        public DateTime? DateSent { get; set; }
    }
}
