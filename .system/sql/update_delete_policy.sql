-- Allow authenticated users to DELETE orders
create policy "Admin Delete Orders"
  on orders
  for delete
  to authenticated
  using (true);

-- Allow authenticated users to DELETE order_items (needed for cascade delete permissions)
create policy "Admin Delete Order Items"
  on order_items
  for delete
  to authenticated
  using (true);
