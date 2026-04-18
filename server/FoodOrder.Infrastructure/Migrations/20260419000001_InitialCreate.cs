using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814

namespace FoodOrder.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table => table.PrimaryKey("PK_categories", x => x.Id));

            migrationBuilder.CreateTable(
                name: "otp_codes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Code = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsUsed = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table => table.PrimaryKey("PK_otp_codes", x => x.Id));

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table => table.PrimaryKey("PK_users", x => x.Id));

            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    WeightGrams = table.Column<int>(type: "integer", nullable: true),
                    Calories = table.Column<int>(type: "integer", nullable: true),
                    Tags = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_products_categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Street = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Apartment = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Entrance = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Floor = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    Intercom = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Comment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_addresses_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "product_addons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_addons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_addons_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "product_ingredients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_ingredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_ingredients_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "product_sizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Label = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PriceDelta = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    WeightGrams = table.Column<int>(type: "integer", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_sizes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_sizes_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AddressId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Total = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Comment = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_orders_addresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "addresses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_orders_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "order_items",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    OrderId = table.Column<int>(type: "integer", nullable: false),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SizeLabel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    AddonsJson = table.Column<string>(type: "jsonb", nullable: true),
                    RemovedIngredientsJson = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_order_items_orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_order_items_products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "order_reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    OrderId = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_order_reviews_orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "order_status_history",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    OrderId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Note = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_order_status_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_order_status_history_orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // ── Seed data ──────────────────────────────────────────────────

            migrationBuilder.InsertData("categories", new[] { "Id", "Name", "SortOrder" }, new object[,]
            {
                { 1, "Популярное", 0 },
                { 2, "Пицца",      1 },
                { 3, "Бургеры",    2 },
                { 4, "Паста",      3 },
                { 5, "Салаты",     4 },
                { 6, "Напитки",    5 },
                { 7, "Десерты",    6 },
            });

            migrationBuilder.InsertData("products",
                new[] { "Id", "CategoryId", "Name", "Description", "Price", "WeightGrams", "Calories", "Tags", "SortOrder" },
                new object[,]
                {
                    { 1, 3, "Бургер «Мегавкусный»", "Сочная котлета из говядины с фирменным соусом, хрустящим салатом и томатом", 390m, 280, 620, "Говядина,Острое", 0 },
                    { 2, 3, "Бургер «Классик»",      "Классический бургер с говяжьей котлетой и свежими овощами",               290m, 240, 520, "Говядина",        1 },
                    { 3, 2, "Пицца «Маргарита»",     "Томатный соус, моцарелла, свежие томаты, базилик",                        450m, 500, 800, "Вегетарианское",  0 },
                    { 4, 5, "Салат «Цезарь»",        "Романо, куриное филе, крутоны, пармезан, соус Цезарь",                    320m, 250, 380, "Курица",          0 },
                });

            migrationBuilder.InsertData("product_sizes",
                new[] { "Id", "ProductId", "Label", "PriceDelta", "WeightGrams", "SortOrder" },
                new object[,]
                {
                    { 1, 1, "S",     -50m, 210, 0 },
                    { 2, 1, "M",       0m, 280, 1 },
                    { 3, 1, "L",      80m, 380, 2 },
                    { 4, 3, "25 см", -100m, 380, 0 },
                    { 5, 3, "30 см",   0m,  500, 1 },
                    { 6, 3, "35 см",  150m, 680, 2 },
                });

            migrationBuilder.InsertData("product_addons",
                new[] { "Id", "ProductId", "Name", "Price", "SortOrder" },
                new object[,]
                {
                    { 1, 1, "Двойной сыр",         60m, 0 },
                    { 2, 1, "Бекон",                80m, 1 },
                    { 3, 1, "Халапеньо",            40m, 2 },
                    { 4, 1, "Дополнительный соус",  30m, 3 },
                    { 5, 3, "Дополнительный сыр",   70m, 0 },
                    { 6, 3, "Пепперони",            90m, 1 },
                });

            migrationBuilder.InsertData("product_ingredients",
                new[] { "Id", "ProductId", "Name", "SortOrder" },
                new object[,]
                {
                    { 1, 1, "Лук",           0 },
                    { 2, 1, "Огурец",        1 },
                    { 3, 1, "Соус тартар",   2 },
                    { 4, 1, "Томат",         3 },
                });

            // ── Indexes ────────────────────────────────────────────────────

            migrationBuilder.CreateIndex("IX_addresses_UserId",         "addresses",           "UserId");
            migrationBuilder.CreateIndex("IX_categories_SortOrder",     "categories",          "SortOrder");
            migrationBuilder.CreateIndex("IX_order_items_OrderId",      "order_items",         "OrderId");
            migrationBuilder.CreateIndex("IX_order_items_ProductId",    "order_items",         "ProductId");
            migrationBuilder.CreateIndex("IX_order_reviews_OrderId",    "order_reviews",       "OrderId", unique: true);
            migrationBuilder.CreateIndex("IX_order_status_history_OrderId",   "order_status_history", "OrderId");
            migrationBuilder.CreateIndex("IX_order_status_history_OccurredAt","order_status_history", "OccurredAt");
            migrationBuilder.CreateIndex("IX_orders_AddressId",         "orders",              "AddressId");
            migrationBuilder.CreateIndex("IX_orders_CreatedAt",         "orders",              "CreatedAt");
            migrationBuilder.CreateIndex("IX_orders_Status",            "orders",              "Status");
            migrationBuilder.CreateIndex("IX_orders_UserId",            "orders",              "UserId");
            migrationBuilder.CreateIndex("IX_otp_codes_Phone_IsUsed",   "otp_codes",           new[] { "Phone", "IsUsed" });
            migrationBuilder.CreateIndex("IX_product_addons_ProductId", "product_addons",      "ProductId");
            migrationBuilder.CreateIndex("IX_product_ingredients_ProductId", "product_ingredients", "ProductId");
            migrationBuilder.CreateIndex("IX_product_sizes_ProductId",  "product_sizes",       "ProductId");
            migrationBuilder.CreateIndex("IX_products_CategoryId",      "products",            "CategoryId");
            migrationBuilder.CreateIndex("IX_products_IsAvailable",     "products",            "IsAvailable");
            migrationBuilder.CreateIndex("IX_products_SortOrder",       "products",            "SortOrder");
            migrationBuilder.CreateIndex("IX_users_Phone",              "users",               "Phone", unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable("order_status_history");
            migrationBuilder.DropTable("order_reviews");
            migrationBuilder.DropTable("order_items");
            migrationBuilder.DropTable("orders");
            migrationBuilder.DropTable("addresses");
            migrationBuilder.DropTable("product_addons");
            migrationBuilder.DropTable("product_ingredients");
            migrationBuilder.DropTable("product_sizes");
            migrationBuilder.DropTable("products");
            migrationBuilder.DropTable("categories");
            migrationBuilder.DropTable("otp_codes");
            migrationBuilder.DropTable("users");
        }
    }
}
