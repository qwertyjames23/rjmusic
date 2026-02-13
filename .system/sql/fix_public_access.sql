-- Drop existing policies to avoid conflicts and ensure clean state
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Public variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- Re-enable RLS to be sure
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Create policies again with explicit permissions
CREATE POLICY "Public products are viewable by everyone" ON products FOR
SELECT TO public USING (true);
CREATE POLICY "Public variants are viewable by everyone" ON product_variants FOR
SELECT TO public USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR
SELECT TO public USING (true);
CREATE POLICY "Public reviews are viewable by everyone" ON reviews FOR
SELECT TO public USING (true);
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT TO public USING (true);