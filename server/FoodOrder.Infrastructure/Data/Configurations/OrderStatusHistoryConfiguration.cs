using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class OrderStatusHistoryConfiguration : IEntityTypeConfiguration<OrderStatusHistory>
{
    public void Configure(EntityTypeBuilder<OrderStatusHistory> builder)
    {
        builder.ToTable("order_status_history");

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).UseIdentityAlwaysColumn();

        builder.Property(h => h.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(h => h.Note).HasMaxLength(300);
        builder.Property(h => h.OccurredAt).HasDefaultValueSql("now()");

        builder.HasIndex(h => h.OrderId);
        builder.HasIndex(h => h.OccurredAt);

        builder.HasOne(h => h.Order)
            .WithMany(o => o.StatusHistory)
            .HasForeignKey(h => h.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
