# rjmusic.shop — Production E-Commerce Platform

A fully operational music accessories e-commerce store built from scratch and deployed to production. Not a tutorial project — real inventory, real orders, real customers.

**Live:** [rjmusic.shop](https://rjmusic.shop)

## What's Built

**Storefront**
- Product catalog with variant support (size, type, price per variant)
- Real-time stock tracking — out-of-stock items automatically blocked from purchase
- Cloudinary-powered image delivery with optimization

**Checkout & Orders**
- Full checkout flow with order confirmation and order number generation
- COD and GCash payment methods
- Automated order status notifications sent directly to customers via Facebook Messenger

**Admin Dashboard** *(protected, role-based)*
- Order management — view, filter, update status in real time
- Inventory management — products, variants, stock levels
- Analytics — revenue breakdown, top products, order source (website vs Messenger), payment method split
- GA4 integration for visitor and traffic data

**Facebook Messenger Integration**
- AI-powered order bot handles customer orders end-to-end via Messenger chat
- Order status updates automatically pushed to customers when status changes
- Deduplication logic prevents double-processing of webhook events

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth |
| Storage | Cloudinary |
| Deployment | Netlify |
| Analytics | GA4 via `@next/third-parties` |
| Messenger Bot | Node.js + GPT-4o-mini, deployed on Render |

## Architecture Notes

- **Serverless-first** — all backend logic runs as Netlify Functions; no persistent server required
- **RLS enforced** — all database access goes through Supabase Row Level Security policies; admin operations use a service role scoped to server-side only
- **Messenger notifications** — status change triggers fire from the admin API and call the Messenger Send API directly; no polling, no Supabase Realtime dependency on the frontend
- **Variant system** — products can have multiple variants (e.g., string gauges); price and stock aggregate from variants when `has_variants = true`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
ADMIN_EMAIL=
PAGE_ACCESS_TOKEN=
GOOGLE_GENERATIVE_AI_API_KEY=
```

## Local Development

```bash
npm install
cp .env.local.example .env.local  # fill in credentials
npm run dev
```
