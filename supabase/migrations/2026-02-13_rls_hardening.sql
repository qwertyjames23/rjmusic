-- RLS hardening: replace permissive policies with owner/admin-aware policies

-- Helper function for admin checks
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = uid
      and p.role = 'admin'
  );
$$;

-- Enable RLS on all relevant tables
alter table if exists public.products enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.reviews enable row level security;
alter table if exists public.profiles enable row level security;
alter table if exists public.payments enable row level security;

-- Drop existing policies on target tables to remove permissive legacy rules
do $$
declare
  rec record;
begin
  for rec in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('products','orders','order_items','reviews','profiles','payments')
  loop
    execute format('drop policy if exists %I on %I.%I', rec.policyname, rec.schemaname, rec.tablename);
  end loop;
end $$;

-- PRODUCTS
do $$
begin
  if to_regclass('public.products') is not null then
    execute 'create policy "products_public_read"
      on public.products
      for select
      to anon, authenticated
      using (true)';

    execute 'create policy "products_admin_manage"
      on public.products
      for all
      to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()))';
  end if;
end $$;

-- ORDERS
do $$
begin
  if to_regclass('public.orders') is not null then
    execute 'create policy "orders_insert_guest_or_user"
      on public.orders
      for insert
      to anon, authenticated
      with check (true)';

    execute 'create policy "orders_select_own_or_admin"
      on public.orders
      for select
      to authenticated
      using (user_id = auth.uid() or public.is_admin(auth.uid()))';

    execute 'create policy "orders_update_own_or_admin"
      on public.orders
      for update
      to authenticated
      using (user_id = auth.uid() or public.is_admin(auth.uid()))
      with check (user_id = auth.uid() or public.is_admin(auth.uid()))';

    execute 'create policy "orders_delete_admin_only"
      on public.orders
      for delete
      to authenticated
      using (public.is_admin(auth.uid()))';
  end if;
end $$;

-- ORDER ITEMS
do $$
begin
  if to_regclass('public.order_items') is not null then
    execute 'create policy "order_items_insert_valid_order"
      on public.order_items
      for insert
      to anon, authenticated
      with check (
        exists (
          select 1
          from public.orders o
          where o.id = order_id
            and (
              public.is_admin(auth.uid())
              or o.user_id = auth.uid()
              or (auth.uid() is null and o.user_id is null)
            )
        )
      )';

    execute 'create policy "order_items_select_own_or_admin"
      on public.order_items
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.orders o
          where o.id = order_id
            and (o.user_id = auth.uid() or public.is_admin(auth.uid()))
        )
      )';

    execute 'create policy "order_items_delete_admin_only"
      on public.order_items
      for delete
      to authenticated
      using (public.is_admin(auth.uid()))';
  end if;
end $$;

-- REVIEWS
do $$
begin
  if to_regclass('public.reviews') is not null then
    execute 'create policy "reviews_public_read"
      on public.reviews
      for select
      to anon, authenticated
      using (true)';

    execute 'create policy "reviews_insert_owner_only"
      on public.reviews
      for insert
      to authenticated
      with check (
        auth.uid() = user_id
        and (
          order_id is null
          or exists (
            select 1
            from public.orders o
            where o.id = order_id
              and o.user_id = auth.uid()
          )
        )
      )';

    execute 'create policy "reviews_delete_owner_or_admin"
      on public.reviews
      for delete
      to authenticated
      using (auth.uid() = user_id or public.is_admin(auth.uid()))';
  end if;
end $$;

-- PROFILES
do $$
begin
  if to_regclass('public.profiles') is not null then
    execute 'create policy "profiles_select_own_or_admin"
      on public.profiles
      for select
      to authenticated
      using (id = auth.uid() or public.is_admin(auth.uid()))';

    execute 'create policy "profiles_insert_own_or_admin"
      on public.profiles
      for insert
      to authenticated
      with check (id = auth.uid() or public.is_admin(auth.uid()))';

    execute 'create policy "profiles_update_own_or_admin"
      on public.profiles
      for update
      to authenticated
      using (id = auth.uid() or public.is_admin(auth.uid()))
      with check (id = auth.uid() or public.is_admin(auth.uid()))';
  end if;
end $$;

-- PAYMENTS
do $$
begin
  if to_regclass('public.payments') is not null then
    execute 'create policy "payments_select_own_or_admin"
      on public.payments
      for select
      to authenticated
      using (
        public.is_admin(auth.uid())
        or exists (
          select 1
          from public.orders o
          where o.id = order_id
            and o.user_id = auth.uid()
        )
      )';

    execute 'create policy "payments_admin_manage"
      on public.payments
      for all
      to authenticated
      using (public.is_admin(auth.uid()))
      with check (public.is_admin(auth.uid()))';
  end if;
end $$;
