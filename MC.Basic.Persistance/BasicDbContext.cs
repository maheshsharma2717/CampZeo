using MC.Basic.Domains.Common;
using MC.Basic.Domains.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance {
    public class BasicDbContext : DbContext
    {
        public BasicDbContext(DbContextOptions<BasicDbContext> options) : base(options) { }

        public DbSet<Organisation> Organizations { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Campaign> Campaigns { get; set; }
        public DbSet<CampaignPost> CampaignPosts{ get; set; }
        public DbSet<PostTransaction> PostTransactions{ get; set; }
        public DbSet<PostInsight> PostInsights { get; set; }
        public DbSet<Contact> Contact { get; set; }
        public DbSet<AdminPlatformConfiguration> AdminPlatformConfigurations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(BasicDbContext).Assembly); 

            base.OnModelCreating(modelBuilder);
        }

        //public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken()) {
        //    try
        //    {
        //        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        //        {
        //            switch (entry.State)
        //            {
        //                case EntityState.Added:
        //                    entry.Entity.CreatedDate = DateTime.Now;
        //                    break;
        //                case EntityState.Modified:
        //                    entry.Entity.LastModifiedDate = DateTime.Now;
        //                    break;

        //            }
        //        }

        //        return base.SaveChangesAsync(cancellationToken);
        //    }
        //    catch (Exception ex)
        //    {

        //        throw;
        //    }

        //}
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            try
            {
                foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
                {
                    switch (entry.State)
                    {
                        case EntityState.Added:
                            entry.Entity.CreatedDate = DateTime.Now;
                            break;
                        case EntityState.Modified:
                            entry.Entity.LastModifiedDate = DateTime.Now;
                            break;
                    }
                }

                return await base.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                // Capture inner exception
                Console.WriteLine("Exception: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("Inner Exception: " + ex.InnerException.Message);

                throw; // rethrow the exception
            }
        }

    }
}
