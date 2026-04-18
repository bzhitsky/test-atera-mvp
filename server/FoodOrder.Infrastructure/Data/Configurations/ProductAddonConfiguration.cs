using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class ProductAddonConfiguration : IEntityTypeConfiguration<ProductAddon>
{
    public void Configure(EntityTypeBuilder<ProductAddon> builder)
    {
        builder.ToTable("product_addons");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).UseIdentityAlwaysColumn();

        builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Price).HasPrecision(10, 2);
        builder.Property(a => a.ImageUrl).HasMaxLength(500);

        builder.HasOne(a => a.Product)
            .WithMany(p => p.Addons)
            .HasForeignKey(a => a.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasData(
            new ProductAddon { Id = 1, ProductId = 1, Name = "Двойной сыр", Price = 60m, SortOrder = 0 },
            new ProductAddon { Id = 2, ProductId = 1, Name = "Бекон", Price = 80m, SortOrder = 1 },
            new ProductAddon { Id = 3, ProductId = 1, Name = "Халапеньо", Price = 40m, SortOrder = 2 },
            new ProductAddon { Id = 4, ProductId = 1, Name = "Дополнительный соус", Price = 30m, SortOrder = 3 },
            new ProductAddon { Id = 5, ProductId = 3, Name = "Дополнительный сыр", Price = 70m, SortOrder = 0 },
            new ProductAddon { Id = 6, ProductId = 3, Name = "Пепперони", Price = 90m, SortOrder = 1 }
        );
    }
}
