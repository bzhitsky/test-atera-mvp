using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class UserCartConfiguration : IEntityTypeConfiguration<UserCart>
{
    public void Configure(EntityTypeBuilder<UserCart> builder)
    {
        builder.ToTable("user_carts");

        builder.HasKey(c => c.UserId);

        builder.Property(c => c.ItemsJson)
            .IsRequired()
            .HasColumnType("text")
            .HasDefaultValue("[]");

        builder.Property(c => c.UpdatedAt)
            .HasColumnType("timestamp with time zone")
            .HasDefaultValueSql("now()");

        builder.HasOne(c => c.User)
            .WithOne()
            .HasForeignKey<UserCart>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
