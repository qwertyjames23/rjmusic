-- Performance indexes for core commerce queries

create index if not exists idx_orders_created_at
  on public.orders (created_at desc);

create index if not exists idx_orders_status
  on public.orders (status);

create index if not exists idx_orders_user_id
  on public.orders (user_id);

create index if not exists idx_order_items_order_id
  on public.order_items (order_id);

create index if not exists idx_order_items_product_id
  on public.order_items (product_id);

create index if not exists idx_reviews_product_id
  on public.reviews (product_id);

create index if not exists idx_payments_order_id
  on public.payments (order_id);

create index if not exists idx_payments_status
  on public.payments (status);
