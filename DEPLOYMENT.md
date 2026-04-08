# Deployment Runbook

Last updated: February 14, 2026

## Pipeline Overview

- `CI` workflow runs on push to `main` and `develop`, and PR to `main`.
- `Deploy` workflow runs only after `CI` completes successfully.
- Branch mapping:
  - `develop` -> `staging` (Vercel preview deployment)
  - `main` -> `production` (Vercel production deployment)
- Branch setup + exact verification commands:
  - `DEVELOP_BRANCH_SETUP.md`

## Required GitHub Secrets

Set these secrets in the repository:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

If any secret is missing, deploy jobs fail fast before deployment starts.

## Required GitHub Environments

Create these environments in GitHub repo settings:

- `staging`
- `production`

Recommended:

- Add required reviewers for `production`.
- Add environment-scoped secrets if you split staging/prod Vercel projects later.

## Safe Deploy Checklist

1. Confirm latest `CI` workflow is green.
2. Confirm required secrets are configured.
3. Merge to `develop` for staging verification.
4. Validate staging checkout/cart/order flows.
5. Merge to `main` for production deploy.
6. Verify production health (home, product, cart, checkout, admin login).

## Rollback Procedure

1. Open Vercel dashboard and identify the last healthy deployment.
2. Promote that deployment to production.
3. Revert problematic commit in `main`.
4. Push revert commit and confirm `CI` and `Deploy` pass.
5. Document incident cause and fix in project notes.
