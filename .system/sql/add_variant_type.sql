-- ============================================
-- Add variant_type column to product_variants
-- ============================================
-- This allows grouping variants by type (e.g., "Model", "Size", "Color", "Gauge")
-- On the customer side, variants are grouped into separate selectors by type.
-- If variant_type is NULL or empty, variants appear in a single flat list (legacy behavior).
ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS variant_type TEXT DEFAULT NULL;
-- Add index for fast group lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_type ON product_variants(product_id, variant_type);