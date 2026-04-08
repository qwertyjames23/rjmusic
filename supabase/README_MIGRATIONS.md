# Supabase Migrations

Last updated: February 13, 2026

## Apply Order

1. `20260214030100_core_hardening.sql`
2. `20260214030200_rls_hardening.sql`
3. `20260214030300_indexes.sql`

## Notes

- Run first in local/staging before production.
- Review existing data before applying `CHECK` constraints.
- If existing bad data exists, fix data first, then re-run migrations.
