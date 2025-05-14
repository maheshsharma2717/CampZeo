using MC.Basic.Application.Contracts.Persistance;
using MC.Basic.Persistance.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance {
    public static class PersistanceServiceRegistration 
    {
        public static IServiceCollection AddPersistanceServices(this IServiceCollection services, IConfiguration configuration) 
        {
            services.AddDbContext<BasicDbContext>(options => options.UseSqlServer(configuration.GetConnectionString("BasicConnectionString")));
            services.AddScoped(typeof(IAsyncRepository<>), typeof(BaseRepository<>));
            services.AddScoped<IOrganisationRepository, OrganizationRepository>();
            services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }

    }
}
