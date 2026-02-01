INSERT INTO products (name, description, price, category, brand, images, in_stock, rating, reviews, tags, features)
VALUES (
  'Test Database Guitar',
  'This is a test guitar directly from the Supabase Database to verify cart functionality.',
  25000,
  'Guitars',
  'Fender',
  ARRAY['https://placehold.co/600x400/101822/FFF?text=Test+Guitar'],
  true,
  5.0,
  1,
  ARRAY['NEW'],
  ARRAY['Test Feature 1', 'Test Feature 2']
);
