-- Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id) -- Ensure user can only review a product once per order
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Everyone can read reviews
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
CREATE POLICY "Public reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

-- 2. Users can insert reviews only for themselves
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
CREATE POLICY "Users can insert own reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own reviews
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews" 
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Optional: Add average_rating to products table for faster sorting/filtering (denormalization)
-- For now, we can calculate it on the fly or add a Trigger later.
