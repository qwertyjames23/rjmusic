# RJMusic Production Roadmap

Last updated: February 14, 2026

## Goal

Finish the app with stable checkout, secure backend, and reliable deployment so the store is production-ready.

## Success Criteria (Go/No-Go)

- Zero critical security findings.
- Checkout end-to-end flow passes in staging.
- Admin can manage products/orders without manual DB edits.
- Error monitoring and alerts are active.
- Backup + rollback process is documented and tested.

## Phase 1: Scope Freeze (Day 1)

### Deliverables

- Final MVP feature list approved.
- Clear "out of scope" list to avoid scope creep.
- Prioritized backlog in order of business impact.

### MVP In Scope

- Auth (customer/admin roles)
- Product listing + details
- Cart
- Checkout
- Orders + order tracking
- Admin product/order management

## Phase 2: Data + Backend Hardening (Days 2-4)

### Deliverables

- Finalized Supabase schema + migration scripts.
- Full foreign keys and indexes on critical tables.
- Strict RLS policies for all user-facing tables.
- Dev/staging seed scripts.

### Core Tables

- profiles
- products
- product_variants (if needed)
- orders
- order_items
- payments
- reviews

## Phase 3: Auth + Security (Days 5-6)

### Deliverables

- Server-side route protection for admin endpoints/pages.
- Role-based access checks (`admin`, `customer`).
- Validation + sanitization for all API inputs.
- Environment variable audit completed.

### Security Checklist

- No secrets in git history.
- `.env.local` used only for local dev.
- Rate limiting on sensitive endpoints.
- CSRF/session handling verified.

## Phase 4: Checkout Reliability (Days 7-9)

### Deliverables

- Idempotent order creation to prevent duplicates.
- Payment status lifecycle implemented.
- Webhook verification + retry handling.
- Consistent order confirmation data.

### Required States

- `pending`
- `paid`
- `failed`
- `refunded`

## Phase 5: Quality Gate (Days 10-11)

### Deliverables

- Unit tests for pricing/cart/business rules.
- Integration tests for order and checkout APIs.
- E2E flow: login -> cart -> checkout -> success.
- Lint/typecheck/test required in CI before merge.

## Phase 6: Performance + UX Polish (Day 12)

### Deliverables

- Image and bundle optimization on key pages.
- Core Web Vitals reviewed and improved.
- Mobile-first QA pass for top flows.
- Complete loading/error/empty states for key screens.

## Phase 7: CI/CD + Deploy (Day 13)

### Deliverables

- CI pipeline: lint, typecheck, tests.
- Staging deploy on `develop`.
- Production deploy on release tag/main.
- Deployment checklist documented.

### Progress Notes (February 14, 2026)

- Baseline CI workflow added at `.github/workflows/ci.yml`.
- CI now runs on push/PR to `main` with:
  - `npx eslint src/app/admin/orders src/app/admin/reviews src/app/admin/products/page.tsx src/app/admin/inventory src/app/admin/product/new/page.tsx src/app/admin/product/[id]/edit/page.tsx src/app/admin/product/[id]/variants/page.tsx src/app/product/[id]/page.tsx src/components/features/BuyBox.tsx src/app/order-confirmation/[id]/page.tsx src/app/_brands/page.tsx src/lib/data.ts src/components/ui/image-upload.tsx src/utils/supabase/middleware.ts --ext .ts,.tsx` (temporary stabilized scope, expanded)
  - `npx tsc --noEmit --pretty false`
  - `npm run build`
- Placeholder CI env values added for build-time safety:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `ADMIN_EMAIL`
- Deploy workflow added at `.github/workflows/deploy.yml`:
  - Runs only after `CI` succeeds (`workflow_run` trigger).
  - `develop` branch deploys to `staging` environment.
  - `main` branch deploys to `production` environment.
  - Enforces fail-fast checks for `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Deployment runbook added: `DEPLOYMENT.md`.
- Supabase migration gate added in `.github/workflows/ci.yml`:
  - Detects migration changes in PR/push range.
  - Blocks modification/deletion of historical migration files.
  - Enforces filename format: `YYYYMMDDHHMMSS_description.sql`.
  - Fails on duplicate migration version prefixes.

### Environment Strategy

- `local`
- `staging`
- `production`

## Phase 8: Production Ops + Launch (Day 14)

### Deliverables

- Error monitoring (Sentry or equivalent) active.
- Uptime checks + alerts configured.
- DB backup + restore drill completed.
- Incident runbook and rollback steps documented.

## Immediate Next Actions

1. Create GitHub project board with these phases as columns.
2. Convert each deliverable into tickets with owner and due date.
3. Start with Phase 1 and 2 before adding any new feature work.


