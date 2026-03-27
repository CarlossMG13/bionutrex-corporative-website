ALTER TABLE "home_sections" ADD COLUMN IF NOT EXISTS "titleSegments" TEXT;
ALTER TABLE "home_sections" ADD COLUMN IF NOT EXISTS "accentColor" TEXT;
ALTER TABLE "home_sections" ADD COLUMN IF NOT EXISTS "mediaType" TEXT NOT NULL DEFAULT 'image';
ALTER TABLE "home_sections" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "home_sections" ADD COLUMN IF NOT EXISTS "videoMuted" BOOLEAN NOT NULL DEFAULT true;

-- Add missing columns to sliders table
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "titleSegments" TEXT;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "label" TEXT;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "stats" TEXT;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "button2Text" TEXT;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "button2Link" TEXT;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "accentColor" TEXT NOT NULL DEFAULT '#00e5ff';
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "videoMuted" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "sliders" ADD COLUMN IF NOT EXISTS "mediaType" TEXT NOT NULL DEFAULT 'image';

-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "badge" TEXT,
    "badgeColor" TEXT DEFAULT '#0d40a5',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS "product_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT UNIQUE,
    "pieces" INTEGER,
    "grams" DOUBLE PRECISION,
    "productId" TEXT NOT NULL,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Ensure column and foreign key exist when table already present
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.constraint_name = 'products_categoryId_fkey'
    ) THEN
        BEGIN
            -- Only add constraint if the column exists
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='categoryId') THEN
                ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
            END IF;
        END;
    END IF;
END$$;

ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "productId" TEXT;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.constraint_name = 'product_variants_productId_fkey'
    ) THEN
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_variants' AND column_name='productId') THEN
                ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
            END IF;
        END;
    END IF;
END$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");
CREATE INDEX IF NOT EXISTS "product_variants_sku_idx" ON "product_variants"("sku");
