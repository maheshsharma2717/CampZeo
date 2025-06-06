using MC.Basic.Domain;
using MC.Basic.Domains.Entities;
using MC.Basic.Persistance;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;

namespace MC.Basic.API.Helpers
{
    public static class PlatformConfigurationSeeder
    {
        public static async Task SeedAsync(BasicDbContext context)
        {
            var configsToAdd = new List<AdminPlatformConfiguration>
        {
            // Sms
            new() { Key = "accountSid", Value = "", Platform = PlatformType.SMS },
            new() { Key = "authToken", Value = "", Platform = PlatformType.SMS},
            new() { Key = "twilioNumber", Value = "", Platform = PlatformType.SMS},
            
            // Rcs
            new() { Key = "accountSid", Value = "", Platform = PlatformType.RCS },
            new() { Key = "authToken", Value = "", Platform = PlatformType.RCS },
            new() { Key = "rcsApiUrl", Value = "", Platform = PlatformType.RCS },
       
            
            // Whatsapp
            new() { Key = "accountSid", Value = "", Platform = PlatformType.WhatsApp },
            new() { Key = "authToken", Value = "", Platform = PlatformType.WhatsApp },
            new() { Key = "twilioWhatsappNumber", Value = "", Platform = PlatformType.WhatsApp },
            
            // Email
            new() { Key = "ApiKey", Value = "", Platform = PlatformType.Email },
            new() { Key = "Domain", Value = "", Platform = PlatformType.Email },
            new() { Key = "FromEmail", Value = "", Platform = PlatformType.Email },
          

            // Facebook
            new() { Key = "AppId", Value = "", Platform = PlatformType.Facebook },
            new() { Key = "AppSecret", Value = "", Platform = PlatformType.Facebook },

            // Instagram
            new() { Key = "AppId", Value = "", Platform = PlatformType.Instagram },
            new() { Key = "AppSecret", Value = "", Platform = PlatformType.Instagram },
            
            // Linkedin
            new() { Key = "ClientId", Value = "", Platform = PlatformType.LinkedIn },
            new() { Key = "ClientSecret", Value = "", Platform = PlatformType.LinkedIn } 
            };

            foreach(var config in configsToAdd)
            {
                var exists = await context.AdminPlatformConfigurations.AnyAsync(c => c.Key == config.Key && c.Platform == config.Platform);

                if(!exists)
                {
                    context.AdminPlatformConfigurations.Add(config);
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
