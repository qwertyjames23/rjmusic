-- Order status change audit trail
create table if not exists public.order_status_logs (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    old_status text,
    new_status text not null,
    changed_by_user_id uuid references auth.users(id) on delete set null,
    changed_by_email text,
    created_at timestamptz not null default now()
);

create index if not exists order_status_logs_order_id_idx on public.order_status_logs(order_id);
create index if not exists order_status_logs_created_at_idx on public.order_status_logs(created_at desc);
