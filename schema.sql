-- Full schema created from EF migrations (bypassing broken EF tools)

CREATE TABLE IF NOT EXISTS categories (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Name"      character varying(100) NOT NULL,
    "ImageUrl"  character varying(500),
    "SortOrder" integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "IX_categories_SortOrder" ON categories ("SortOrder");

CREATE TABLE IF NOT EXISTS otp_codes (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Phone"     character varying(20) NOT NULL,
    "Code"      character varying(10) NOT NULL,
    "ExpiresAt" timestamp with time zone NOT NULL,
    "IsUsed"    boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "IX_otp_codes_Phone_IsUsed" ON otp_codes ("Phone", "IsUsed");

CREATE TABLE IF NOT EXISTS users (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "Phone"     character varying(20) NOT NULL,
    "Name"      character varying(100),
    "Email"     character varying(200),
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_users_Phone" ON users ("Phone");

CREATE TABLE IF NOT EXISTS products (
    "Id"          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "CategoryId"  integer NOT NULL,
    "Name"        character varying(200) NOT NULL,
    "Description" character varying(1000),
    "ImageUrl"    character varying(500),
    "Price"       numeric(10,2) NOT NULL,
    "WeightGrams" integer,
    "Calories"    integer,
    "Tags"        character varying(500),
    "IsAvailable" boolean NOT NULL DEFAULT true,
    "SortOrder"   integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_products_categories_CategoryId"
        FOREIGN KEY ("CategoryId") REFERENCES categories ("Id") ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "IX_products_CategoryId"  ON products ("CategoryId");
CREATE INDEX IF NOT EXISTS "IX_products_IsAvailable" ON products ("IsAvailable");
CREATE INDEX IF NOT EXISTS "IX_products_SortOrder"   ON products ("SortOrder");

CREATE TABLE IF NOT EXISTS addresses (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserId"    integer NOT NULL,
    "Label"     character varying(100),
    "Street"    character varying(300) NOT NULL,
    "Apartment" character varying(20),
    "Entrance"  character varying(10),
    "Floor"     character varying(10),
    "Intercom"  character varying(20),
    "Comment"   character varying(500),
    "Latitude"  double precision,
    "Longitude" double precision,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "FK_addresses_users_UserId"
        FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_addresses_UserId" ON addresses ("UserId");

CREATE TABLE IF NOT EXISTS product_addons (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ProductId" integer NOT NULL,
    "Name"      character varying(100) NOT NULL,
    "Price"     numeric(10,2) NOT NULL,
    "ImageUrl"  character varying(500),
    "SortOrder" integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_product_addons_products_ProductId"
        FOREIGN KEY ("ProductId") REFERENCES products ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_product_addons_ProductId" ON product_addons ("ProductId");

CREATE TABLE IF NOT EXISTS product_ingredients (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ProductId" integer NOT NULL,
    "Name"      character varying(100) NOT NULL,
    "SortOrder" integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_product_ingredients_products_ProductId"
        FOREIGN KEY ("ProductId") REFERENCES products ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_product_ingredients_ProductId" ON product_ingredients ("ProductId");

CREATE TABLE IF NOT EXISTS product_sizes (
    "Id"          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ProductId"   integer NOT NULL,
    "Label"       character varying(10) NOT NULL,
    "PriceDelta"  numeric(10,2) NOT NULL,
    "WeightGrams" integer,
    "SortOrder"   integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_product_sizes_products_ProductId"
        FOREIGN KEY ("ProductId") REFERENCES products ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_product_sizes_ProductId" ON product_sizes ("ProductId");

CREATE TABLE IF NOT EXISTS orders (
    "Id"            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "UserId"        integer NOT NULL,
    "AddressId"     integer,
    "Status"        character varying(20) NOT NULL,
    "Type"          character varying(20) NOT NULL,
    "PaymentMethod" character varying(20) NOT NULL,
    "RequestedAt"   timestamp with time zone,
    "Total"         numeric(10,2) NOT NULL,
    "Comment"       character varying(500),
    "CreatedAt"     timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt"     timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "FK_orders_users_UserId"
        FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_orders_addresses_AddressId"
        FOREIGN KEY ("AddressId") REFERENCES addresses ("Id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "IX_orders_AddressId" ON orders ("AddressId");
CREATE INDEX IF NOT EXISTS "IX_orders_CreatedAt" ON orders ("CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_orders_Status"    ON orders ("Status");
CREATE INDEX IF NOT EXISTS "IX_orders_UserId"    ON orders ("UserId");

CREATE TABLE IF NOT EXISTS order_items (
    "Id"                    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "OrderId"               integer NOT NULL,
    "ProductId"             integer NOT NULL,
    "ProductName"           character varying(200) NOT NULL,
    "ImageUrl"              character varying(500),
    "SizeLabel"             character varying(20),
    "Quantity"              integer NOT NULL,
    "UnitPrice"             numeric(10,2) NOT NULL,
    "AddonsJson"            jsonb,
    "RemovedIngredientsJson" jsonb,
    CONSTRAINT "FK_order_items_orders_OrderId"
        FOREIGN KEY ("OrderId") REFERENCES orders ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_order_items_products_ProductId"
        FOREIGN KEY ("ProductId") REFERENCES products ("Id") ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "IX_order_items_OrderId"   ON order_items ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_order_items_ProductId" ON order_items ("ProductId");

CREATE TABLE IF NOT EXISTS order_reviews (
    "Id"        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "OrderId"   integer NOT NULL,
    "Rating"    integer NOT NULL,
    "Comment"   character varying(1000),
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "FK_order_reviews_orders_OrderId"
        FOREIGN KEY ("OrderId") REFERENCES orders ("Id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_order_reviews_OrderId" ON order_reviews ("OrderId");

CREATE TABLE IF NOT EXISTS order_status_history (
    "Id"         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "OrderId"    integer NOT NULL,
    "Status"     character varying(20) NOT NULL,
    "Note"       character varying(300),
    "OccurredAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "FK_order_status_history_orders_OrderId"
        FOREIGN KEY ("OrderId") REFERENCES orders ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_order_status_history_OrderId"    ON order_status_history ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_order_status_history_OccurredAt" ON order_status_history ("OccurredAt");

CREATE TABLE IF NOT EXISTS user_carts (
    "UserId"    integer NOT NULL PRIMARY KEY,
    "ItemsJson" text NOT NULL DEFAULT '[]',
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "FK_user_carts_users_UserId"
        FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);

-- Mark migrations as applied
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES
    ('20260419000001_InitialCreate', '9.0.4'),
    ('20260419000002_AddUserCart',   '9.0.4')
ON CONFLICT DO NOTHING;
