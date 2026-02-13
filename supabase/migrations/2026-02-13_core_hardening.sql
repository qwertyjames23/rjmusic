-- Core schema hardening for production readiness
create extension if not exists "uuid-ossp";

-- Profiles (for role-based access)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer',
  full_name text,
  created_at timestamptz not null default now()
);

-- Ensure orders has ownership + payment fields
alter table if exists public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists payment_status text not null default 'pending',
  add column if not exists idempotency_key text;

-- Ensure reviews has optional order linkage (for verified purchase logic)
alter table if exists public.reviews
  add column if not exists order_id uuid;

do $$
begin
  if to_regclass('public.reviews') is not null then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'reviews_order_id_fkey'
    ) then
      alter table public.reviews
        add constraint reviews_order_id_fkey
        foreign key (order_id) references public.orders(id) on delete cascade;
    end if;
  end if;
end $$;

-- Payments table
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_ref text,
  amount numeric not null,
  status text not null default 'pending',
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Data integrity checks
do $$
begin
  if to_regclass('public.order_items') is not null then
    if not exists (select 1 from pg_constraint where conname = 'order_items_quantity_positive_chk') then
      alter table public.order_items
        add constraint order_items_quantity_positive_chk check (quantity > 0);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'order_items_price_positive_chk') then
      alter table public.order_items
        add constraint order_items_price_positive_chk check (price >= 0);
    end if;
  end if;

  if to_regclass('public.orders') is not null then
    if not exists (select 1 from pg_constraint where conname = 'orders_total_amount_positive_chk') then
      alter table public.orders
        add constraint orders_total_amount_positive_chk check (total_amount >= 0);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'orders_status_chk') then
      alter table public.orders
        add constraint orders_status_chk
        check (status in ('Pending','Processing','Shipped','Delivered','Cancelled'));
    end if;
    if not exists (select 1 from pg_constraint where conname = 'orders_payment_status_chk') then
      alter table public.orders
        add constraint orders_payment_status_chk
        check (payment_status in ('pending','paid','failed','refunded'));
    end if;
  end if;

  if to_regclass('public.reviews') is not null then
    if not exists (select 1 from pg_constraint where conname = 'reviews_rating_range_chk') then
      alter table public.reviews
        add constraint reviews_rating_range_chk check (rating between 1 and 5);
    end if;
  end if;

  if to_regclass('public.payments') is not null then
    if not exists (select 1 from pg_constraint where conname = 'payments_amount_positive_chk') then
      alter table public.payments
        add constraint payments_amount_positive_chk check (amount >= 0);
    end if;
    if not exists (select 1 from pg_constraint where conname = 'payments_status_chk') then
      alter table public.payments
        add constraint payments_status_chk
        check (status in ('pending','paid','failed','refunded'));
    end if;
  end if;
end $$;

-- Uniqueness for idempotent checkout submission key (if provided)
create unique index if not exists idx_orders_idempotency_key_unique
  on public.orders (idempotency_key)
  where idempotency_key is not null;
