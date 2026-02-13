# Supabase Migrations

Last updated: February 13, 2026

## Apply Order

1. `2026-02-13_core_hardening.sql`
2. `2026-02-13_rls_hardening.sql`
3. `2026-02-13_indexes.sql`

## Notes

- Run first in local/staging before production.
- Review existing data before applying `CHECK` constraints.
- If existing bad data exists, fix data first, then re-run migrations.
