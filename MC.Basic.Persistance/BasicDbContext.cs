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

        public DbSet<Organization> Organizations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(BasicDbContext).Assembly);

            var Id = 1;

            modelBuilder.Entity<Organization>().HasData(
                new Organization {
                    Id = Id,
                    Name="Mandav Consuktancy",
                    Address= "Purani mandi",
                    Description ="Test"
                });

            base.OnModelCreating(modelBuilder);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = new CancellationToken()) {
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

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
