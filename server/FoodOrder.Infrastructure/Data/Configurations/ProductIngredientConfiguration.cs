using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class ProductIngredientConfiguration : IEntityTypeConfiguration<ProductIngredient>
{
    public void Configure(EntityTypeBuilder<ProductIngredient> builder)
    {
        builder.ToTable("product_ingredients");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).UseIdentityAlwaysColumn();

        builder.Property(i => i.Name).IsRequired().HasMaxLength(100);

        builder.HasOne(i => i.Product)
            .WithMany(p => p.Ingredients)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasData(
            new ProductIngredient { Id = 1, ProductId = 1, Name = "Лук", SortOrder = 0 },
            new ProductIngredient { Id = 2, ProductId = 1, Name = "Огурец", SortOrder = 1 },
            new ProductIngredient { Id = 3, ProductId = 1, Name = "Соус тартар", SortOrder = 2 },
            new ProductIngredient { Id = 4, ProductId = 1, Name = "Томат", SortOrder = 3 }
        );
    }
}
