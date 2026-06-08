# Contributing to rjmusic

Thanks for your interest in contributing! This is a production e-commerce
application, so the priority is keeping `main` stable and deployable at all
times. The guidelines below keep changes safe and reviewable.

> **Note:** This is primarily a personal / portfolio project that runs a live
> store. External contributions are welcome, but please open an issue to discuss
> any non-trivial change before investing time in a pull request.

## Getting Started

**Prerequisites:** Node.js 20+, a Supabase project, and a Cloudinary account.

```bash
git clone https://github.com/qwertyjames23/rjmusic.git
cd rjmusic
npm install
cp .env.local.example .env.local   # then fill in your credentials
npm run dev                          # → http://localhost:3000
```

Database and deployment setup are documented in
[`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md) and
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Development Workflow

1. **Branch** off `main` using a descriptive prefix:
   - `feat/…` new features
   - `fix/…` bug fixes
   - `docs/…` documentation
   - `chore/…` tooling, dependencies, cleanup
   - `ci/…` pipeline changes
2. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   `type: short description` (e.g. `fix: prevent duplicate order on webhook retry`).
3. **Keep pull requests focused** — one logical change per PR.

## Before You Open a PR

Run the same checks CI runs, and make sure they pass:

```bash
npm run lint        # ESLint
npx tsc --noEmit    # TypeScript typecheck
npm test            # Jest unit / integration tests
npm run build       # Production build
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and the build on
every PR — it must be green before a PR can merge. Netlify also posts a deploy
preview for each PR.

## Database Migrations

Schema changes go in `supabase/migrations/` as **new** timestamped files
(`YYYYMMDDHHMMSS_description.sql`). CI blocks edits to — or deletion of —
existing migration files and enforces the filename format. Never modify a
migration that has already been applied.

## Code Style

- TypeScript, Next.js App Router conventions, and Tailwind CSS.
- Let ESLint and the existing patterns guide formatting — match the surrounding code.
- Keep all database access behind Supabase RLS; never expose the service-role key
  to the client.

## Reporting Bugs & Requesting Features

Use the [issue templates](https://github.com/qwertyjames23/rjmusic/issues/new/choose).
For security issues, **do not** open a public issue — see
[`SECURITY.md`](SECURITY.md).
