-- Make 'brand' optional in the products table
ALTER TABLE products ALTER COLUMN brand DROP NOT NULL;
