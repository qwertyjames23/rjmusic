-- ==========================================
-- RJ MUSIC DATABASE SETUP SCRIPT
-- ==========================================
-- Instructions:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. New Query
-- 3. Paste this entire file content
-- 4. Click "Run"
-- ==========================================

-- 1. Enable UUID Extension (Required for IDs)
create extension if not exists "uuid-ossp";

-- 2. Clean up (Optional: Uncomment to reset DB)
-- drop table if exists order_items;
-- drop table if exists orders;
-- drop table if exists products;

-- 3. Create PRODUCTS Table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text not null,
  brand text not null,
  images text[] default '{}',
  in_stock boolean default true,
  rating numeric default 0,
  reviews integer default 0,
  tags text[] default '{}',
  features text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create ORDERS Table
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  address text not null,
  city text not null,
  region text,
  postal_code text,
  total_amount numeric not null,
  status text default 'Pending', -- Pending, Processing, Shipped, Delivered, Cancelled
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Create ORDER ITEMS Table
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  quantity integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. SECURITY: Enable Row Level Security (RLS)
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- 7. POLICIES (Permissions)

-- PRODUCTS Policies
-- Allow everyone to view products
create policy "Public Read Products"
  on products for select
  to anon, authenticated
  using (true);

-- Allow Admins (or anyone for now, for simplicity of setup) to insert/update products
-- Ideally restrict to service_role or specific admin email in production
create policy "Admin Manage Products"
  on products
  for all
  to authenticated
  using (true)
  with check (true);

-- ORDERS Policies
-- Allow anyone (Guests) to create an order
create policy "Public Create Orders"
  on orders
  for insert
  to anon, authenticated
  with check (true);

-- Allow Admins to View/Update Orders
create policy "Admin View Orders"
  on orders
  for select
  to authenticated
  using (true);

create policy "Admin Update Orders"
  on orders
  for update
  to authenticated
  using (true)
  with check (true);

-- ORDER ITEMS Policies
-- Allow anyone to add items to their order
create policy "Public Create Order Items"
  on order_items
  for insert
  to anon, authenticated
  with check (true);

create policy "Admin View Order Items"
  on order_items
  for select
  to authenticated
  using (true);

-- 8. SEED DATA (Initial Products)
-- Clear existing to avoid duplicates if re-running
delete from products;

insert into products (name, description, price, original_price, category, brand, images, in_stock, rating, reviews, tags, features)
values
(
  'Stratocaster Ultra',
  'The Stratocaster Ultra features a unique Modern D neck profile with Ultra rolled fingerboard edges for hours of playing comfort.',
  106350.00,
  null,
  'Guitars',
  'Fender',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuCShBWHoyXynFzRx6jj2ENw3NnEjYHcDdYck0r1ojzWsoSbYQgsgkQb1O9rPQpHVgZ1kD70sZLVVEmr_nWierrNlhrCV2Jl2pMobXNcVytrj5cuXA39GnJatZajOC7cbuHtUrby9ZEbpiCfehNZyCrfwyxBjrxKDPH69cs5Mzznou4qVoqZuY0eLeXoGrTp-vDORNdaAkW34_8xkRxfUzvrqwbP-NvbxiWZM4NEA9i0IdxvLvvfbDq5cx7NgMFw61pz6VXGfCrkfkk'],
  true,
  4.9,
  128,
  ARRAY['NEW'],
  ARRAY['Modern D neck profile', 'Ultra Noiseless Vintage pickups', 'Compound radius fingerboard']
),
(
  'Studio Vocal Mic',
  'Professional dynamic vocal microphone. Includes a built-in pop filter and shock mount to reduce handling noise.',
  22350.00,
  null,
  'Studio',
  'Shure',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuD9XnAl1l2UVBJVcXsqsXI7iswMvSokID__m1J6fyTJifp11txkPrbGSbF-B5XkZHE5rWaT06E1fjzEUd5lxY-XQto6H7tjj6sXJNLDbU-j2s3U9gCY6WTW7CeTrCoZQTYc8VYdiPEIH9IvXyTxWCWLZGR2D2aYTqapUaWJ1VZEM66wA1EMuBahpvWPiuZ6jWaOG0QHtv0ABUeCmpy0Zpmr2kykLzG5FWOYZxy8X-iyyQmMwlBjW_5kDc_i3vIVdbB9LVfKQAhH1-s'],
  true,
  4.8,
  85,
  ARRAY[]::text[],
  ARRAY['Built-in pop filter', 'Cardioid polar pattern', 'Integrated shock mount']
),
(
  'Analog Synth Pro',
  'A powerhouse 37-key analog synthesizer with dual VCOs, 3-way multi-mode VCF, and a 32-step sequencer.',
  41950.00,
  50350.00,
  'Keys',
  'Korg',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuBBMYeu1-xtAK9ATwz9ZHbHPD_BEilR_1np8SgN2llmG3MBi17qZWksmg3LLQoV9e3QELsdhmgkXUjQ2zDHrZUu6n2G6FR61SjbVJpvDyLo8HzDwqfs4ZaxJL3tgf6y52Qhzv04naqgJGnhvSw9KzL26lC0i82IcYw_5MJVdhxBidZo4yqkVkyRDqWKRzoxj45zRvFIbPIp8CdOfDJTYscECQG7PXiEt_P63g7cPQS8f6ECpc6s1iJ57Dr0QIjacnJSjoRfu2tY16Q'],
  true,
  4.7,
  42,
  ARRAY['SALE'],
  ARRAY['37 full-size keys', 'Dual VCOs', '32-step sequencer']
),
(
  'Reference Headphones',
  'Closed-back studio reference headphones for monitoring and mixing. Delivers exceptional isolation.',
  13950.00,
  null,
  'Accessories',
  'Audio-Technica',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuCpRYoSQc2gDdbbdjKVk-V7IrSvHpHKv8J-SNPQ4nP2gM6zMi8p4DxbcA4pXxDaCcpgIIUHxRjizdn9eZ1zhn4Nb1-sV5YIM8khiQFFpUGyKTYRw0_ZHoxkR5hQimrVxE9Yn7Shx47o3jYfMQbwdEVkfbhtQpoaE0RHYH7jEYqGimvEjgvuUp4hmACo6N2Z21li3VSCheVBj9ypLB4_mULH9Xlxyx_OGrqqR_UOhBCiFMi3gxIiMI5s7fdmWclcxmOwOQZFFryVmC8'],
  true,
  4.6,
  215,
  ARRAY[]::text[],
  ARRAY['45mm large-aperture drivers', '90-degree swiveling earcups', 'Detachable cables']
),
(
  'Professional Drum Kit',
  'A complete 5-piece drum kit with cymbals and hardware. Features birch shells for a balanced, articulate sound.',
  85000.00,
  null,
  'Percussion',
  'Pearl',
  ARRAY['https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=2070&auto=format&fit=crop'],
  true, -- Set to true for demo purposes
  5.0,
  12,
  ARRAY[]::text[],
  ARRAY['6-ply Birch shells', 'Suspension mounting system', 'Includes hardware pack']
),
(
  'Grand Stage Piano',
  '88-key stage piano with weighted hammer action and premium grand piano sound engine.',
  185000.00,
  null,
  'Keys',
  'Nord',
  ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop'],
  true,
  4.9,
  34,
  ARRAY['BESTSELLER'],
  ARRAY['Triple Sensor keybed', 'Advanced Layering', 'Seamless transitions']
);
