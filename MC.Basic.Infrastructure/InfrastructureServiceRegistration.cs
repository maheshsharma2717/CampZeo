using AutoMapper;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Models.Authorization;
using MC.Basic.Application.Models.Mail;
using MC.Basic.Infrastructure.Authorization;
using MC.Basic.Infrastructure.Mail;
using MC.Basic.Infrastructure.Message;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Basic.Infrastructure {
    public static class InfrastructureServiceRegistration 
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration) 
        {
                        
            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
            services.AddTransient<ITokenService, TokenService>();

            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
            services.AddTransient<IEmailService, EmailService>(); 
            
            //services.Configure<TwilioSettings>(configuration.GetSection("TwilioSettings"));
            services.AddTransient<IAuthenticationService, IAuthenticationService>();
            return services;
        }
    }
}
