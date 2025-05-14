using MC.Basic.Application.Contracts.Infrasructure;
using MimeKit;
using System.Net.Mail;
using MailKit.Net.Smtp;
namespace MC.Basic.Infrastructure.Mail
{
    public class EmailService : IEmailService 
    {
        //public EmailSettings _emailSettings{ get;}

        //public EmailService(IOptions<EmailSettings> emailSettings) 
        //{
        //    _emailSettings = emailSettings.Value;
        //}

        //public async Task<bool> SendEmail(Email email) 
        //{
        //    var client = new SendGridClient(_emailSettings.ApiKey);

        //    var subject = email.Subject;
        //    var to = new EmailAddress(email.To);
        //    var body = email.Body;

        //    var from = new EmailAddress 
        //    {
        //        Email = _emailSettings.FromAddress,
        //        Name = _emailSettings.FromName
        //    };

        //    var sendGridMessage = MailHelper.CreateSingleEmail(from, to, subject, body, body );
        //    var response = await client.SendEmailAsync( sendGridMessage );

        //    if (response.StatusCode == System.Net.HttpStatusCode.Accepted ||
        //        response.StatusCode == System.Net.HttpStatusCode.OK) 
        //    {
        //        return true;
        //    }

        //    return false;
        //}

        // You can configure the email settings here
        private readonly string _smtpServer = "smtp.gmail.com";
        private readonly int _smtpPort = 587; // or your provider's SMTP port
        private readonly string _smtpUser = "office@mandavconsultancy.com";
        //private readonly string _smtpPass = "Anay#123@";
        private readonly string _smtpPass = "AnBqrAe7j4mP9rU%";
        private readonly string _websiteUrl = "http://localhost:4200"; // Your website address

        public async Task SendPasswordToUserEmail(string userEmail, string password)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Campaign Management", _smtpUser));
            message.To.Add(new MailboxAddress("", userEmail));
            message.Subject = "Your Account Details";

            // Build the email body with website URL and password
            message.Body = new TextPart("plain")
            {
                Text = $@"Dear User,

                        Your new password is: {password}

                        You can log in to your account using the following link:
                        {_websiteUrl}/login

                        Please keep your password safe and do not share it with anyone.

                        Best regards,
                        Campaign Management Team"
            };

            using(var client = new MailKit.Net.Smtp.SmtpClient())
            {
                try
                {
                    // Connect to the SMTP server
                    await client.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);

                    // Authenticate with your credentials
                    await client.AuthenticateAsync(_smtpUser, _smtpPass);

                    // Send the email
                    await client.SendAsync(message);
                }
                catch(Exception ex)
                {
                    // Handle any errors
                    Console.WriteLine($"Error sending email: {ex.Message}");
                } finally
                {
                    await client.DisconnectAsync(true);
                }
            }
        }
        public async Task SendEmailMessage(string userEmail, string messageText)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Campaign Management", _smtpUser));
            message.To.Add(new MailboxAddress("", userEmail));
            message.Subject = "Your Account Details";

            // Build the email body with website URL and password
            message.Body = new TextPart("plain")
            {
                Text = messageText
            };

            using(var client = new MailKit.Net.Smtp.SmtpClient())
            {
                try
                {
                    // Connect to the SMTP server
                    await client.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);

                    // Authenticate with your credentials
                    await client.AuthenticateAsync(_smtpUser, _smtpPass);

                    // Send the email
                    await client.SendAsync(message);
                }
                catch(Exception ex)
                {
                    // Handle any errors
                    Console.WriteLine($"Error sending email: {ex.Message}");
                } finally
                {
                    await client.DisconnectAsync(true);
                }
            }
        }
    }
}
