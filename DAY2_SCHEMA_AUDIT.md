# Day 2 Schema Audit (Supabase)

Date: February 13, 2026
Repo: `rjmusic`

## What Was Audited

- `supabase_setup.sql`
- `database_init.sql`
- `setup_orders.sql`
- `create_reviews_table.sql`
- `fix_orders_policy.sql`
- `fix_reviews_fk.sql`
- `update_delete_policy.sql`

## High-Risk Findings

1. Duplicate/fragmented schema scripts
- Multiple files create overlapping tables and policies with different definitions.
- Risk: inconsistent environments and failed reruns.

2. Over-permissive RLS policies
- Several policies use `to authenticated using (true)` for admin actions.
- Risk: any authenticated user can perform admin operations.

3. Reviews schema mismatch
- `fix_reviews_fk.sql` references `reviews.order_id`, but `create_reviews_table.sql` does not create `order_id`.
- Risk: migration failure and broken referential logic.

4. Orders not tied to authenticated user profile
- `orders` table does not include owner linkage (`user_id`/`profile_id`) in current scripts.
- Risk: weak ownership model and harder user-order access control.

5. Missing data integrity constraints
- `quantity`, `price`, and `total_amount` do not enforce positive values.
- Risk: invalid commerce data.

## Medium-Risk Findings

1. Missing idempotency key for checkout
- No clear DB-level support for preventing duplicate checkout submission.

2. Missing normalized status checks
- `orders.status` and payment state values are not constrained.

3. Rerun-safety gaps
- Some scripts use plain `create table`/`create policy` without idempotent guard or drop-if-exists logic.

## Day 2 Decisions (Proposed)

1. Choose one canonical migration path:
- Keep `database_init.sql` as legacy reference only.
- Move active schema to versioned migrations folder (new).

2. Add/standardize core tables:
- `profiles`
- `products`
- `orders` (with ownership + status constraints)
- `order_items`
- `payments`
- `reviews`

3. Implement strict role model:
- Admin checks based on role in `profiles`.
- Customer access limited to own records.

4. Make scripts rerunnable:
- Use `if not exists` and policy recreation guards.

## Day 2 Action List (Ready to Implement)

1. Create `supabase/migrations/2026-02-13_core_hardening.sql`
- Consolidate table constraints/indexes.
- Add missing columns (`orders.user_id`, `reviews.order_id` if required).
- Add check constraints for positive numeric fields.

2. Create `supabase/migrations/2026-02-13_rls_hardening.sql`
- Drop permissive admin policies.
- Recreate with role-aware predicates.

3. Create `supabase/migrations/2026-02-13_indexes.sql`
- Index `orders(created_at)`, `orders(status)`, `orders(user_id)`, `order_items(order_id)`, `reviews(product_id)`.

4. Add `supabase/README_MIGRATIONS.md`
- Define apply order for local/staging/prod.

## Blockers Before Implementation

- Confirm where admin role is stored (`profiles.role` vs app metadata).
- Confirm whether guest checkout stays enabled for production.
- Confirm payment provider webhook strategy for `payments` table states.
