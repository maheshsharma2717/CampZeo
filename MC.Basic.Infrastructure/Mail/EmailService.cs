using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.Mail;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Infrastructure.Mail {
    public class EmailService : IEmailService 
    {
        public EmailSettings _emailSettings{ get;}

        public EmailService(IOptions<EmailSettings> emailSettings) 
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task<bool> SendEmail(Email email) 
        {
            var client = new SendGridClient(_emailSettings.ApiKey);
            
            var subject = email.Subject;
            var to = new EmailAddress(email.To);
            var body = email.Body;

            var from = new EmailAddress 
            {
                Email = _emailSettings.FromAddress,
                Name = _emailSettings.FromName
            };

            var sendGridMessage = MailHelper.CreateSingleEmail(from, to, subject, body, body );
            var response = await client.SendEmailAsync( sendGridMessage );

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted ||
                response.StatusCode == System.Net.HttpStatusCode.OK) 
            {
                return true;
            }

            return false;
        }
    }
}
