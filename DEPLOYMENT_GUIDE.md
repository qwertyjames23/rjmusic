# Deployment Guide - Fixing Authentication Redirects

## Problem

When logging in on the Vercel deployed app, users are redirected to `localhost:3000` instead of staying on the production domain.

## Solution

The authentication redirects are now configured to work dynamically based on the environment.

---

## Steps to Deploy to Vercel

### 1. **Update Vercel Environment Variables**

Go to your Vercel project settings and add the following environment variable:

```env
NEXT_PUBLIC_SITE_URL=https://rjmusic.vercel.app
```

### 2. **Update Supabase Configuration**

Go to your Supabase Dashboard:

- Navigate to: <https://ytgwjbmmnkhcvrmaxrvs.supabase.co>
- Go to **Authentication** → **URL Configuration**

#### Update Site URL

Set the **Site URL** to your Vercel deployment URL:

```text
https://rjmusic.vercel.app
```

#### Add Redirect URLs

In the **Redirect URLs** section, add both:

```text
http://localhost:3000/**
https://rjmusic.vercel.app/**
```

This allows authentication to work in both development and production.

### 3. **Deploy to Vercel**

Push your changes to your Git repository:

```bash
git add .
git commit -m "Fix authentication redirects for production"
git push
```

Vercel will automatically deploy your changes.

### 4. **Verify the Fix**

1. Go to your Vercel deployment URL
2. Try logging in
3. You should now stay on the production domain instead of being redirected to localhost

---

## What Changed

### Files Modified

1. **`.env.local`** - Added `NEXT_PUBLIC_SITE_URL` for local development
2. **`src/utils/supabase/server.ts`** - Added auth configuration with PKCE flow
3. **`src/utils/supabase/client.ts`** - Added auth configuration for browser client
4. **`src/utils/supabase/middleware.ts`** - Added auth configuration for middleware

### Key Changes

- Enabled **PKCE (Proof Key for Code Exchange)** flow for better security
- Configured proper session detection and persistence
- Made the site URL configurable via environment variables

---

## Testing Locally

Your local development should still work as before:

```bash
npm run dev
```

The app will use `http://localhost:3000` as configured in `.env.local`.

---

## Troubleshooting

If you still experience redirect issues:

1. **Clear browser cookies** for both localhost and your Vercel domain
2. **Verify Supabase settings** - Make sure the redirect URLs are saved
3. **Check Vercel environment variables** - Ensure `NEXT_PUBLIC_SITE_URL` is set correctly
4. **Redeploy** - Sometimes Vercel needs a fresh deployment to pick up env changes

---

## Need Help?

If you encounter any issues, check:

- Vercel deployment logs
- Browser console for errors
- Supabase Auth logs in the dashboard
