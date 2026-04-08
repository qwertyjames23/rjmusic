# RJMusic Phase Tickets

Created: February 13, 2026
Owner default: RJ

## P1 Scope Freeze

### T1 - Lock MVP Scope
- Priority: P0
- Owner: RJ
- Due: February 13, 2026
- Acceptance Criteria:
  - MVP list documented in `IMPLEMENTATION_PLAN.md`.
  - Product owner sign-off complete.

### T2 - Lock Out-of-Scope
- Priority: P1
- Owner: RJ
- Due: February 13, 2026
- Acceptance Criteria:
  - Out-of-scope list documented in `IMPLEMENTATION_PLAN.md`.
  - Any non-MVP request gets routed to backlog.

### T3 - Board Columns Setup
- Priority: P1
- Owner: RJ
- Due: February 13, 2026
- Acceptance Criteria:
  - Board columns match `BOARD_SETUP.md`.

### T4 - Backlog Ticketization
- Priority: P0
- Owner: RJ
- Due: February 13, 2026
- Acceptance Criteria:
  - Phase deliverables converted to actionable tickets with owner/due/criteria.

## P2 Data and Backend Hardening

### T5 - Finalize Schema
- Priority: P0
- Owner: RJ
- Due: February 14, 2026
- Acceptance Criteria:
  - Core tables finalized: profiles, products, orders, order_items, payments, reviews.
  - Migration files committed.

### T6 - Constraints and Indexes
- Priority: P0
- Owner: RJ
- Due: February 15, 2026
- Acceptance Criteria:
  - FK/unique/not-null constraints active.
  - Indexes added for critical read/write paths.

### T7 - RLS Policies
- Priority: P0
- Owner: RJ
- Due: February 16, 2026
- Acceptance Criteria:
  - RLS enabled on user-facing tables.
  - Policy matrix tested for customer/admin/service role.

### T8 - Seed and Data Integrity
- Priority: P1
- Owner: RJ
- Due: February 16, 2026
- Acceptance Criteria:
  - Deterministic seed command for local/staging.
  - Integrity checks prevent invalid records.

## P3 Auth and Security

### T9 - Admin Page/API Protection
- Priority: P0
- Owner: RJ
- Due: February 17, 2026
- Acceptance Criteria:
  - Non-admin access blocked server-side for admin pages and APIs.

### T10 - Input Validation and Rate Limit
- Priority: P0
- Owner: RJ
- Due: February 18, 2026
- Acceptance Criteria:
  - API inputs validated.
  - Sensitive endpoints rate-limited.

### T11 - Secrets and Env Audit
- Priority: P0
- Owner: RJ
- Due: February 18, 2026
- Acceptance Criteria:
  - No secrets in repo.
  - Environment variable mapping finalized for local/staging/prod.

## P4 Checkout Reliability

### T12 - Idempotent Checkout
- Priority: P0
- Owner: RJ
- Due: February 19, 2026
- Acceptance Criteria:
  - Duplicate submit cannot create duplicate orders.

### T13 - Payment Lifecycle Consistency
- Priority: P0
- Owner: RJ
- Due: February 20, 2026
- Acceptance Criteria:
  - Statuses supported: pending, paid, failed, refunded.
  - Order/payment state transitions are valid.

### T14 - Webhook Verification and Retry Safety
- Priority: P0
- Owner: RJ
- Due: February 21, 2026
- Acceptance Criteria:
  - Signature verification enabled.
  - Duplicate webhook events do not break consistency.

## P5 Quality Gate

### T15 - Unit and Integration Coverage
- Priority: P1
- Owner: RJ
- Due: February 22, 2026
- Acceptance Criteria:
  - Critical business logic and checkout APIs covered.

### T16 - E2E Critical Path
- Priority: P0
- Owner: RJ
- Due: February 23, 2026
- Acceptance Criteria:
  - login -> cart -> checkout -> success passes in staging.

### T17 - CI Required Checks
- Priority: P0
- Owner: RJ
- Due: February 23, 2026
- Acceptance Criteria:
  - PR merge blocked unless lint/typecheck/tests pass.

## P6 Performance and UX Polish

### T18 - Performance Optimization
- Priority: P1
- Owner: RJ
- Due: February 24, 2026
- Acceptance Criteria:
  - Key pages show measurable load improvement.

### T19 - Mobile and State QA
- Priority: P1
- Owner: RJ
- Due: February 24, 2026
- Acceptance Criteria:
  - Mobile pass for checkout/profile paths.
  - Loading/error/empty states complete.

## P7 CI/CD and Deploy

### T20 - Staging and Production Pipelines
- Priority: P0
- Owner: RJ
- Due: February 25, 2026
- Acceptance Criteria:
  - develop auto-deploys to staging.
  - release/main path deploys to production.

### T21 - Deployment Dry Run
- Priority: P0
- Owner: RJ
- Due: February 25, 2026
- Acceptance Criteria:
  - Dry run checklist completed with no unresolved blocker.

## P8 Production Ops and Launch

### T22 - Monitoring and Alerts
- Priority: P0
- Owner: RJ
- Due: February 26, 2026
- Acceptance Criteria:
  - Error monitoring active.
  - Alert path tested.

### T23 - Backup and Restore Drill
- Priority: P0
- Owner: RJ
- Due: February 26, 2026
- Acceptance Criteria:
  - Restore test completed and documented.

### T24 - Go/No-Go Launch Review
- Priority: P0
- Owner: RJ
- Due: February 26, 2026
- Acceptance Criteria:
  - All success criteria in `ROADMAP_PROD.md` are satisfied.
