# Staging Apply Checklist (Day 2)

Date: February 14, 2026

## 1) Apply Migrations In Order

Run these in Supabase SQL Editor (staging project):

1. `supabase/migrations/20260214030100_core_hardening.sql`
2. `supabase/migrations/20260214030200_rls_hardening.sql`
3. `supabase/migrations/20260214030300_indexes.sql`

## 2) Run Validation SQL

Run:

- `supabase/validation/20260214_post_apply_validation.sql`

Expected:

- Core tables exist (`profiles`, `payments` + existing commerce tables).
- Check constraints exist for order/payment/review integrity.
- RLS enabled on target tables.
- No permissive legacy policies remain.
- Required indexes exist.

## 3) Smoke Tests (App)

1. Customer can browse products.
2. Customer can create order + order items.
3. Customer can only view own orders.
4. Non-admin cannot access admin-only writes.
5. Admin can manage products/orders/payments.

## 4) Mark Day 2 Complete After Pass

Update:

- `IMPLEMENTATION_PLAN.md` Day 2 checkboxes to done.
- Create one short migration execution note with date/time and result.
