-- 1. Create the CATEGORIES Table
CREATE TABLE IF NOT EXISTS categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon_name text, -- e.g., 'Guitar', 'Piano', 'Drum' for icon mapping
  image_url text, -- Optional image for the category
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
alter table categories enable row level security;

-- 3. Create POLICIES for access control
-- Allow public read access
create policy "Public Read Categories"
  on categories for select
  to anon, authenticated
  using (true);

-- Allow admins to manage categories
create policy "Admin Manage Categories"
  on categories for all
  to authenticated
  using (
    -- This is a placeholder for a real admin check.
    -- In production, you would check against a user role or a specific user ID.
    true 
  );

-- 3b. Ensure icon_name column exists (may not exist if table was created before this migration)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_name text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;

-- 4. SEED DATA (Initial Categories)
-- Clear existing to avoid duplicates if re-running
delete from categories;

insert into categories (name, slug, description, icon_name)
values
  ('Guitars', 'guitars', 'Electric, acoustic, and bass guitars.', 'Guitar'),
  ('Keys', 'keys', 'Pianos, keyboards, and synthesizers.', 'Piano'),
  ('Percussion', 'percussion', 'Drum kits, cymbals, and accessories.', 'Drum'),
  ('Studio', 'studio', 'Microphones, audio interfaces, and monitors.', 'Mic'),
  ('Accessories', 'accessories', 'Cables, strings, picks, and more.', 'Headphones');
