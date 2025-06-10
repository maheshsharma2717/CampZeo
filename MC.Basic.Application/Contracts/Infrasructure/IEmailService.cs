using MC.Basic.Application.Models.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Application.Contracts.Infrasructure {
    public interface IEmailService
    {
        Task SendPasswordToUserEmail(string userEmail, string password);
        Task SendEmailMessage(string userEmail, string message);
    }
}
