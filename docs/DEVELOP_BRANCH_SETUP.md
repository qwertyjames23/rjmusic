# Develop Branch Setup and Deploy Verification

> **Deprecated (June 7, 2026).** This guide described a `develop` → `staging`
> and `main` → `production` deploy pipeline driven by a Vercel `Deploy` GitHub
> Action. That pipeline was never wired up (no `VERCEL_*` secrets were ever
> configured) and the workflow has since been removed.
>
> rjmusic deploys on **Netlify** via its GitHub integration — PR deploy
> previews plus a production deploy on merge to `main`. There is no
> `develop`/`staging` branch flow.
>
> For the current process, see [`DEPLOYMENT.md`](./DEPLOYMENT.md).
