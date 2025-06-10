using MC.Basic.Domains.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Models.DataModel
{
    public class EventContactMessageDto
    {
        public EventContactMessageDto()
        {
            Contacts = new List<Contact>();
            
        }
        public CampaignPost? Post { get; set; }
        public List<Contact> Contacts { get; set; }

    }
}
