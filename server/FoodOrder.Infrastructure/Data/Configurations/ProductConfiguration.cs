using FoodOrder.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodOrder.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).UseIdentityAlwaysColumn();

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Description).HasMaxLength(1000);
        builder.Property(p => p.ImageUrl).HasMaxLength(500);
        builder.Property(p => p.Price).HasPrecision(10, 2);
        builder.Property(p => p.Tags).HasMaxLength(500);
        builder.Property(p => p.IsAvailable).HasDefaultValue(true);

        builder.HasIndex(p => p.CategoryId);
        builder.HasIndex(p => p.IsAvailable);
        builder.HasIndex(p => p.SortOrder);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed data — demo burgers
        builder.HasData(
            new Product
            {
                Id = 1, CategoryId = 3, Name = "Бургер «Мегавкусный»",
                Description = "Сочная котлета из говядины с фирменным соусом, хрустящим салатом и томатом",
                Price = 390m, WeightGrams = 280, Calories = 620,
                Tags = "Говядина,Острое", SortOrder = 0
            },
            new Product
            {
                Id = 2, CategoryId = 3, Name = "Бургер «Классик»",
                Description = "Классический бургер с говяжьей котлетой и свежими овощами",
                Price = 290m, WeightGrams = 240, Calories = 520,
                Tags = "Говядина", SortOrder = 1
            },
            new Product
            {
                Id = 3, CategoryId = 2, Name = "Пицца «Маргарита»",
                Description = "Томатный соус, моцарелла, свежие томаты, базилик",
                Price = 450m, WeightGrams = 500, Calories = 800,
                Tags = "Вегетарианское", SortOrder = 0
            },
            new Product
            {
                Id = 4, CategoryId = 5, Name = "Салат «Цезарь»",
                Description = "Романо, куриное филе, крутоны, пармезан, соус Цезарь",
                Price = 320m, WeightGrams = 250, Calories = 380,
                Tags = "Курица", SortOrder = 0
            }
        );
    }
}
