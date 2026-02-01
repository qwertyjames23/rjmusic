-- Allow Admins (Authenticated Users) to update orders (e.g. change status)
create policy "Admin update orders"
on orders
for update
to authenticated
using (true)
with check (true);

-- Ensure RLS is enabled
alter table orders enable row level security;
