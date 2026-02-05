-- Create categories table
create table if not exists public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text not null unique, -- For URL friendly links
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies
create policy "Public categories are viewable by everyone."
    on public.categories for select
    using ( true );

create policy "Admins can insert categories."
    on public.categories for insert
    with check ( auth.role() = 'authenticated' ); -- Ideally check for role = 'admin' if roles implemented

create policy "Admins can update categories."
    on public.categories for update
    using ( auth.role() = 'authenticated' );

create policy "Admins can delete categories."
    on public.categories for delete
    using ( auth.role() = 'authenticated' );
