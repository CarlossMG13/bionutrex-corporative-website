-- Reconcile historical drift for Product/Category model evolution
-- Goal: make migration chain safe for fresh and existing databases without reset

-- 1) Ensure categories exists
CREATE TABLE IF NOT EXISTS "categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE
);

-- Ensure at least one category exists for backfilling product.categoryId
INSERT INTO "categories" ("id", "name", "slug")
VALUES ('default-category', 'General', 'general')
ON CONFLICT ("slug") DO NOTHING;

-- 2) Ensure products has target columns
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Backfill categoryId for legacy rows
UPDATE "products"
SET "categoryId" = (
  SELECT c."id" FROM "categories" c ORDER BY c."id" LIMIT 1
)
WHERE "categoryId" IS NULL;

-- Enforce not-null only after backfill
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'categoryId'
      AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;
  END IF;
END$$;

-- 3) Ensure FK from products(categoryId) -> categories(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'products'
      AND tc.constraint_name = 'products_categoryId_fkey'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

-- 4) Ensure product_variants exists
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sku" TEXT UNIQUE,
  "pieces" INTEGER,
  "grams" DOUBLE PRECISION,
  "productId" TEXT NOT NULL
);

-- Ensure FK from product_variants(productId) -> products(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'product_variants'
      AND tc.constraint_name = 'product_variants_productId_fkey'
      AND tc.constraint_type = 'FOREIGN KEY'
  ) THEN
    ALTER TABLE "product_variants"
      ADD CONSTRAINT "product_variants_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "products"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

-- 5) Migrate legacy products.price into a default variant if needed, then drop products.price
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'price'
  ) THEN
    INSERT INTO "product_variants" ("id", "name", "price", "stock", "productId")
    SELECT
      'var_' || substring(md5(p."id" || '_default') from 1 for 20),
      'Default',
      p."price",
      0,
      p."id"
    FROM "products" p
    WHERE p."price" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "product_variants" pv WHERE pv."productId" = p."id"
      );

    ALTER TABLE "products" DROP COLUMN "price";
  END IF;
END$$;

-- 6) Ensure required indexes
CREATE INDEX IF NOT EXISTS "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");
CREATE INDEX IF NOT EXISTS "product_variants_sku_idx" ON "product_variants"("sku");
