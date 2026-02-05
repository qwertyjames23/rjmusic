-- Fix permissions for products table
-- This script ensures that authenticated users (admins) can CRUD products, and public can read them.

-- Enable RLS
alter table products enable row level security;

-- Remove conflicting policies to ensure clean state
do $$
declare
  r record;
begin
  for r in select policyname from pg_policies where tablename = 'products' loop
    execute 'drop policy if exists "' || r.policyname || '" on products';
  end loop;
end $$;

-- Public can view products (Storefront access)
create policy "Public read access"
  on products for select
  using (true);

-- Authenticated users (Admins) can modify products
create policy "Authenticated insert"
  on products for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated update"
  on products for update
  using (auth.role() = 'authenticated');

create policy "Authenticated delete"
  on products for delete
  using (auth.role() = 'authenticated');
