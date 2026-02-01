-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Products Table
create table products (
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

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create Policy: Allow Public Read Access
create policy "Allow public read access"
  on products
  for select
  to anon
  using (true);

-- Create Policy: Allow Service Role (Admin) full access
-- (Service role has full access by default, but explicit policies can be good)
