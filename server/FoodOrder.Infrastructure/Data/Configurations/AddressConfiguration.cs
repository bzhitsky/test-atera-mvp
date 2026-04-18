using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.ToTable("addresses");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).UseIdentityAlwaysColumn();

        builder.Property(a => a.Label).HasMaxLength(100);
        builder.Property(a => a.Street).IsRequired().HasMaxLength(300);
        builder.Property(a => a.Apartment).HasMaxLength(20);
        builder.Property(a => a.Entrance).HasMaxLength(10);
        builder.Property(a => a.Floor).HasMaxLength(10);
        builder.Property(a => a.Intercom).HasMaxLength(20);
        builder.Property(a => a.Comment).HasMaxLength(500);
        builder.Property(a => a.CreatedAt).HasDefaultValueSql("now()");

        builder.HasIndex(a => a.UserId);

        builder.HasOne(a => a.User)
            .WithMany(u => u.Addresses)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
