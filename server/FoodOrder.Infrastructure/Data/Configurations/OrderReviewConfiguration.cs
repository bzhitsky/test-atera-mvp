using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class OrderReviewConfiguration : IEntityTypeConfiguration<OrderReview>
{
    public void Configure(EntityTypeBuilder<OrderReview> builder)
    {
        builder.ToTable("order_reviews");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).UseIdentityAlwaysColumn();

        builder.Property(r => r.Rating)
            .IsRequired()
            .HasAnnotation("Range", new[] { 1, 5 });

        builder.Property(r => r.Comment).HasMaxLength(1000);
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("now()");

        builder.HasIndex(r => r.OrderId).IsUnique();
    }
}
