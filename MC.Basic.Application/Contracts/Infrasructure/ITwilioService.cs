using MC.Basic.Application.Models.Mail;
using MC.Basic.Application.Models.Message;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Infrasructure
{
    public interface ITwilioService
    {
        Task<bool> SendMessage(TwilioMessage message);
        Task<bool> SendBulkMessages(List<TwilioMessage> messages);
        Task<MessageLog> CheckLogForSingleMessage(string messageSid);
        Task<List<MessageLog>> CheckLogsForAllMessages();

    }
}
