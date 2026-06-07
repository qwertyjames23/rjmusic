# Deployment Runbook

Last updated: June 7, 2026

## Overview

rjmusic is deployed on **Netlify** (site `rjmusicshop`, domain `rjmusic.shop`)
via Netlify's GitHub integration. GitHub Actions handles continuous
integration; Netlify handles building and hosting.

- **CI (`.github/workflows/ci.yml`)** runs on push to `main` and on PRs to
  `main`: Supabase migration guard → `npm run lint` → `npx tsc --noEmit` →
  `npm test` → `npm run build`.
- **Netlify** builds and deploys automatically:
  - Every PR gets a **Deploy Preview** (`deploy-preview-<n>--rjmusicshop.netlify.app`).
  - Merging to `main` triggers a **production** deploy to `rjmusic.shop`.

Build settings live in [`netlify.toml`](../netlify.toml): build command
`npm run build`, publish directory `.next`, Node 22.

## Environment Variables (Netlify)

Set these in **Netlify → Site settings → Environment variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `ADMIN_EMAIL`
- `PAGE_ACCESS_TOKEN`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `RESEND_API_KEY`

## Safe Deploy Checklist

1. Open a PR to `main`; confirm the `CI` check is green.
2. Review the Netlify **Deploy Preview** (home, product, cart, checkout, admin login).
3. Merge to `main`.
4. Confirm the production deploy succeeds in the Netlify dashboard.
5. Verify production health on `rjmusic.shop` (home, product, cart, checkout, admin login).

## Rollback Procedure

1. Open the **Netlify dashboard → Deploys**.
2. Find the last healthy deploy and **Publish deploy** to roll back instantly.
3. Revert the problematic commit in `main`.
4. Push the revert and confirm `CI` is green and Netlify redeploys cleanly.
5. Document the incident cause and fix in project notes.
