-- Create Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  address text not null,
  city text not null,
  region text,
  postal_code text,
  total_amount numeric not null,
  status text default 'Pending', -- Pending, Processing, Completed, Cancelled
  payment_method text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id), -- Optional: if product deleted, keep record? usually separate logic, but simple ref for now
  product_name text not null, -- Snapshot of name in case product changes
  quantity integer not null,
  price numeric not null, -- Snapshot of price at time of purchase
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Orders
alter table orders enable row level security;
alter table order_items enable row level security;

-- Policies
-- Admin can see all
create policy "Admin read all orders" on orders for select to authenticated using (true); -- Simplified for now (ideally check if admin)
create policy "Admin read all items" on order_items for select to authenticated using (true);

-- Users can create orders (public for now if guest checkout, or authenticated)
create policy "Public insert orders" on orders for insert to anon, authenticated with check (true);
create policy "Public insert items" on order_items for insert to anon, authenticated with check (true);
