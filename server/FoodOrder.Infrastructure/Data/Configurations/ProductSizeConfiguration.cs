using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class ProductSizeConfiguration : IEntityTypeConfiguration<ProductSize>
{
    public void Configure(EntityTypeBuilder<ProductSize> builder)
    {
        builder.ToTable("product_sizes");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).UseIdentityAlwaysColumn();

        builder.Property(s => s.Label).IsRequired().HasMaxLength(10);
        builder.Property(s => s.PriceDelta).HasPrecision(10, 2);

        builder.HasOne(s => s.Product)
            .WithMany(p => p.Sizes)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Sizes for burger products
        builder.HasData(
            new ProductSize { Id = 1, ProductId = 1, Label = "S", PriceDelta = -50m, WeightGrams = 210, SortOrder = 0 },
            new ProductSize { Id = 2, ProductId = 1, Label = "M", PriceDelta = 0m,   WeightGrams = 280, SortOrder = 1 },
            new ProductSize { Id = 3, ProductId = 1, Label = "L", PriceDelta = 80m,  WeightGrams = 380, SortOrder = 2 },
            // Sizes for pizza
            new ProductSize { Id = 4, ProductId = 3, Label = "25 см", PriceDelta = -100m, WeightGrams = 380, SortOrder = 0 },
            new ProductSize { Id = 5, ProductId = 3, Label = "30 см", PriceDelta = 0m,    WeightGrams = 500, SortOrder = 1 },
            new ProductSize { Id = 6, ProductId = 3, Label = "35 см", PriceDelta = 150m,  WeightGrams = 680, SortOrder = 2 }
        );
    }
}
