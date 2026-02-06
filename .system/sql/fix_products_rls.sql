-- Fix Products RLS Policies to allow Admin updates (stock management)

-- 1. Ensure RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- 3. Re-create Policies

-- READ: Everyone can see products
CREATE POLICY "Public products are viewable by everyone"
  ON products FOR SELECT
  USING ( true );

-- INSERT: Authenticated users can add products
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );

-- UPDATE: Authenticated users can update products (Critical for Stock Management)
CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING ( auth.role() = 'authenticated' );

-- DELETE: Authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING ( auth.role() = 'authenticated' );
