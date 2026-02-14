-- Post-apply validation checks for Day 2 migrations

-- 1) Tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('products', 'orders', 'order_items', 'reviews', 'profiles', 'payments')
order by table_name;

-- 2) RLS enabled
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('products', 'orders', 'order_items', 'reviews', 'profiles', 'payments')
order by c.relname;

-- 3) Constraints presence
select conname, conrelid::regclass as table_name
from pg_constraint
where conname in (
  'orders_total_amount_positive_chk',
  'orders_status_chk',
  'orders_payment_status_chk',
  'order_items_quantity_positive_chk',
  'order_items_price_positive_chk',
  'reviews_rating_range_chk',
  'payments_amount_positive_chk',
  'payments_status_chk',
  'reviews_order_id_fkey'
)
order by conname;

-- 4) Index presence
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_orders_idempotency_key_unique',
    'idx_orders_created_at',
    'idx_orders_status',
    'idx_orders_user_id',
    'idx_order_items_order_id',
    'idx_order_items_product_id',
    'idx_reviews_product_id',
    'idx_payments_order_id',
    'idx_payments_status'
  )
order by indexname;

-- 5) Policies snapshot
select tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('products', 'orders', 'order_items', 'reviews', 'profiles', 'payments')
order by tablename, policyname;
