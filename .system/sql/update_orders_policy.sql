-- Fix permissions for orders table to allow Admin updates
-- This script gives Admin users access to manage all orders

-- 1. Grant Admin role to all existing users (For Development convenience)
-- In production, manage roles carefully!
UPDATE profiles SET role = 'admin' WHERE role IS NULL OR role = 'customer';

-- 2. Drop existing Admin policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- 3. Add Admin Policies to ORDERS
-- Check if user has 'admin' role in profiles
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Add Admin Policies to ORDER_ITEMS
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
