-- ============================================
-- Product Variants Table
-- ============================================
-- Each product can have multiple variants (e.g., string gauges, colors, sizes)
-- If a product has no variants, it behaves as a simple product (legacy support)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    -- e.g. "Light 10-47", "Medium 11-52", "Model 11027"
    price NUMERIC(10, 2) NOT NULL,
    -- Variant-specific price
    stock INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    -- Optional variant-specific image
    sort_order INTEGER NOT NULL DEFAULT 0,
    -- For ordering buttons
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- Index for fast lookup by product
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_product_variants_sort_order ON product_variants(product_id, sort_order);
-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active variants" ON product_variants;
DROP POLICY IF EXISTS "Admin can manage variants" ON product_variants;
-- Public can view active variants
CREATE POLICY "Anyone can view active variants" ON product_variants FOR
SELECT USING (is_active = true);
-- Admin can do everything (using service role key bypasses RLS anyway,
-- but this policy allows admin operations via regular client too)
CREATE POLICY "Admin can manage variants" ON product_variants FOR ALL USING (
    auth.jwt()->>'email' = 'raffyjames65@gmail.com'
);
-- Also add a "has_variants" column to products table for quick filtering
-- (optional optimization to avoid JOIN queries for simple products)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS has_variants BOOLEAN DEFAULT false;