# Roadmap

This is a high-level summary. The detailed, phase-by-phase production roadmap
lives in [`docs/ROADMAP_PROD.md`](docs/ROADMAP_PROD.md).

## Status

rjmusic.shop is **live in production** on Netlify with real inventory and orders.
The core store — catalog, variants, checkout, orders, admin dashboard, and the
Facebook Messenger order bot — is complete and operational.

## Done ✅

- Storefront with product variants and real-time stock tracking
- Checkout with COD / GCash and order-number generation
- Role-based admin dashboard (orders, inventory, analytics)
- Supabase schema hardening with strict Row Level Security
- Idempotent order creation (no duplicate orders on webhook retries)
- AI Facebook Messenger order bot with status notifications
- CI pipeline (lint, typecheck, tests, build) + Netlify deploy previews

## In progress / next 🚧

- Expanding automated test coverage (unit + integration)
- Performance & Core Web Vitals polish on key pages
- Production ops: error monitoring, uptime alerts, backup / restore drill

## Ideas / backlog 💡

- Additional payment methods
- Customer account enhancements (order history, re-order)
- Richer analytics in the admin dashboard

See [`docs/ROADMAP_PROD.md`](docs/ROADMAP_PROD.md) for the full plan and
success criteria.
