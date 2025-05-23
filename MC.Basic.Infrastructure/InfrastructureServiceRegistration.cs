using AutoMapper;
using CampaignManagement.AI.Intigration.Service;
using MC.Basic.Application.Contracts.Infrasructure;
using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Application.Models.Authorization;
using MC.Basic.Application.Models.Mail;
using MC.Basic.Application.Models.Post;
using MC.Basic.Application.Services;
using MC.Basic.Infrastructure.Authorization;
using MC.Basic.Infrastructure.Mail;
using MC.Basic.Infrastructure.Message;
using MC.Basic.Infrastructure.Services;
using MC.Basic.Persistance.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Basic.Infrastructure {
    public static class InfrastructureServiceRegistration 
    {
        public static IServiceCollection AddInfrastructureService(this IServiceCollection services, IConfiguration configuration) 
        {
            services.AddHttpContextAccessor();

            services.Configure<JwtSettings>(configuration.GetSection("JwtSettings"));
            services.AddTransient<ITokenService, TokenService>();

            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
            services.AddTransient<IEmailService, EmailService>(); 
            
            //services.Configure<TwilioSettings>(configuration.GetSection("TwilioSettings"));
            services.AddTransient<IAuthenticationService, AuthenticationService>();
            services.AddTransient<IApplicationService, ApplicationService>();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<IApplicationService, ApplicationService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IOrganisationRepository, OrganizationRepository>();
            services.AddScoped<IContactRepository, ContactRepository>();
            services.AddScoped<ICampaignRepository, CampaignRepository>();
            services.AddScoped<ICampaignPostRepository, CampaignPostRepository>();
            services.AddScoped<IMailgunEmailService, MailgunEmailService>();
            services.AddScoped<ITwilioSmsService, TwilioSmsService>();
            services.AddScoped<ITwilioService, TwilioService>();
            services.AddScoped<IInfobipSmsService, InfobipSmsService>();
            services.AddScoped<IGeminiService, GeminiService>();
            services.AddScoped<IPlatformConfigurationRepository, PlatformConfigurationRepository>();

            services.Configure<FacebookSettings>(configuration.GetSection("Facebook"));
            services.Configure<InstaSettings>(configuration.GetSection("Instagram"));
            return services;
        }
    }
}
