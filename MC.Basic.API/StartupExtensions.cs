﻿using Icms.Helpers;
using MC.Basic.Application;
using MC.Basic.Infrastructure;
using MC.Basic.Persistance;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text;
namespace MC.Basic.API
{
    public static class StartupExtensions
    {
        public static WebApplication ConfigureServices(this WebApplicationBuilder builder)
        {
            // Add services to the container
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidAudience = builder.Configuration["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"]))
                };
            });
            
            builder.Services.AddAuthorization();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Fleet Management API", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Description = "Enter your Bearer token here"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
            },
            Array.Empty<string>()
        }
    });
            });

            builder.Services.AddApplicationServices();
            builder.Services.AddInfrastructureService(builder.Configuration);
            builder.Services.AddPersistanceServices(builder.Configuration);

            builder.Services.AddControllers();

            builder.Services.AddCors(options => options.AddPolicy("open", policy => policy.WithOrigins([builder.Configuration["ApiUrl"] ?? "https://localhost:7020",
                builder.Configuration["ClientUrl"] ?? "https://Localhost:4200"])
            .AllowAnyMethod()
            .SetIsOriginAllowed(pol => true)
            .AllowAnyHeader()
            .AllowCredentials()));


            Log.Logger = new LoggerConfiguration()
    .WriteTo.Console() // Logs to console
    .WriteTo.File("Logs/log.txt", rollingInterval: RollingInterval.Day) // Logs to a file
    .Enrich.FromLogContext() // Adds contextual information
    .CreateLogger();

            // Add Serilog to the logging system
            builder.Logging.ClearProviders();
            builder.Logging.AddSerilog();

            builder.Host.UseSerilog();

            return builder.Build();
        }

        public static WebApplication ConfigurePipeline(this WebApplication app)
        {
            app.UseHttpsRedirection();         
            app.UseCors("open");               

            if(app.Environment.IsDevelopment())
            {
                app.UseSwagger();              
                app.UseSwaggerUI();
            }

            app.UseAuthentication();           
            app.UseMiddleware<JwtMiddleware>();
            app.UseAuthorization();            

            app.MapControllers();              
            return app;
        }

        public static async Task ResetDatabaseAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();

            try
            {
                var context = scope.ServiceProvider.GetService<BasicDbContext>();
                if(context != null)
                {
                    await context.Database.EnsureCreatedAsync();
                    await context.Database.MigrateAsync();
                }
            }
            catch(Exception ex)
            {
                //logs here
            }
        }

    }
}
