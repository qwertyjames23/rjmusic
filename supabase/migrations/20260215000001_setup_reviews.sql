-- 1. Create the REVIEWS Table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  product_id uuid references products(id) on delete cascade,
  order_id uuid references orders(id) on delete set null, -- Optional: Link review to a specific order
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Ensure a user can only review a product once
  unique (user_id, product_id)
);

-- 2. Enable Row Level Security
alter table reviews enable row level security;

-- 3. Create POLICIES for access control
-- Allow public read access
create policy "Public Read Reviews"
  on reviews for select
  to anon, authenticated
  using (true);

-- Allow authenticated users to insert a review
create policy "Authenticated Insert Reviews"
  on reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow users to update their own reviews
create policy "User Update Own Reviews"
  on reviews for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow users to delete their own reviews
create policy "User Delete Own Reviews"
  on reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4. Enable Realtime updates for the reviews table
alter publication supabase_realtime add table reviews;

-- 5. Helper function to check if a user has purchased a product
create or replace function has_purchased(p_user_id uuid, p_product_id uuid)
returns boolean as $$
  select exists (
    select 1
    from orders
    join order_items on orders.id = order_items.order_id
    where orders.user_id = p_user_id
      and order_items.product_id = p_product_id::text
      and orders.status = 'Delivered' -- or any other status that qualifies
  );
$$ language sql security definer;
