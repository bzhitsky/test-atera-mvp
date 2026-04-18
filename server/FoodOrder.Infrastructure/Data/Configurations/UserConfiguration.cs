using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).UseIdentityAlwaysColumn();

        builder.Property(u => u.Phone)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(u => u.Phone).IsUnique();

        builder.Property(u => u.Name).HasMaxLength(100);
        builder.Property(u => u.Email).HasMaxLength(200);
        builder.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
    }
}
