# Develop Branch Setup and Deploy Verification

Last updated: February 14, 2026

## Why this file exists

The deploy workflow maps branches like this:

- `develop` -> `staging`
- `main` -> `production`

To test staging safely, you must create and use `develop`.

## One-Time Setup

Run these from repo root:

```bash
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop
```

## Staging Deploy Test Flow

1. Create a tiny test commit on `develop`:

```bash
git checkout develop
git pull origin develop
git commit --allow-empty -m "test staging deploy pipeline"
git push origin develop
```

2. In GitHub Actions, verify:
- `CI` runs on `develop` push
- after CI success, `Deploy` runs `deploy-staging`

3. Validate staging URL:
- home page
- product page
- cart
- checkout
- admin login

## Production Deploy Flow

After staging passes:

```bash
git checkout main
git pull origin main
git merge --ff-only develop
git push origin main
```

In GitHub Actions, verify:
- `CI` runs on `main`
- `Deploy` runs `deploy-production`

## If Staging Does Not Trigger

Check in order:

1. `develop` branch exists on remote.
2. `.github/workflows/ci.yml` includes `push` branch `develop`.
3. CI completed successfully on that exact `develop` commit.
4. `deploy.yml` condition for `head_branch == 'develop'` is unchanged.
5. Required deploy secrets exist:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
