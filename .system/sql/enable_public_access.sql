-- Enable RLS on products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- Create policy to allow public read access (SELECT) for everyone, including anonymous users
create policy "Public products are viewable by everyone" on products for
select to public using (true);
-- Enable RLS on product_variants table if not already enabled
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
-- Create policy to allow public read access (SELECT) for everyone
create policy "Public variants are viewable by everyone" on product_variants for
select to public using (true);
-- Enable RLS on categories table if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- Create policy to allow public read access (SELECT) for everyone
create policy "Public categories are viewable by everyone" on categories for
select to public using (true);
-- Enable RLS on reviews table if not already enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- Create policy to allow public read access (SELECT) for everyone
create policy "Public reviews are viewable by everyone" on reviews for
select to public using (true);
-- Enable RLS on profiles table (needed for reviews) if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Create policy to allow public read access to basic profile info (name, avatar)
-- Note: Adjust columns as needed for privacy, but SELECT usually returns all columns unless restricted by column-level security or View
create policy "Public profiles are viewable by everyone" on profiles for
select to public using (true);