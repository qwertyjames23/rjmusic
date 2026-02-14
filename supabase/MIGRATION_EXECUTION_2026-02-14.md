# Migration Execution Note

Date: February 14, 2026
Environment: Linked remote Supabase project (`ytgwjbmmnkhcvrmaxrvs`)

## Applied Migrations

- `20260214030100_core_hardening.sql`
- `20260214030200_rls_hardening.sql`
- `20260214030300_indexes.sql`

## Verification

- `npx supabase migration list` shows local and remote versions aligned for all three migrations.

## Important Follow-Up

- Some check constraints were created as `NOT VALID` to allow migration against legacy rows.
- Run cleanup + `VALIDATE CONSTRAINT` in a controlled follow-up migration after data normalization.
