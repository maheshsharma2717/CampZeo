using MC.Basic.Domains.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MC.Basic.Persistance.Configurations {
    public class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
    {
        public void Configure(EntityTypeBuilder<Organization> entityTypeBuilder) {

            entityTypeBuilder.Property(e => e.Id).IsRequired().UseIdentityColumn();
            entityTypeBuilder.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entityTypeBuilder.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entityTypeBuilder.Property(e => e.Address).IsRequired().HasMaxLength(500);

        }

    }
}
