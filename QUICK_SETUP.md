# Quick Setup Instructions for rjmusic.vercel.app

## ✅ Step 1: Add Vercel Environment Variable

1. Go to: <https://vercel.com/dashboard>
2. Select your `rjmusic` project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://rjmusic.vercel.app`
   - **Environment**: Production, Preview, Development (select all)
5. Click **Save**

## ✅ Step 2: Update Supabase Settings

1. Go to: <https://ytgwjbmmnkhcvrmaxrvs.supabase.co>
2. Navigate to **Authentication** → **URL Configuration**
3. Update **Site URL** to:

   ```
   https://rjmusic.vercel.app
   ```

4. In **Redirect URLs**, add these two URLs:

   ```
   http://localhost:3000/**
   https://rjmusic.vercel.app/**
   ```

5. Click **Save**

## ✅ Step 3: Deploy

Run these commands:

```bash
git add .
git commit -m "Fix authentication redirects for production"
git push
```

Vercel will automatically deploy your changes.

## ✅ Step 4: Test

1. Go to <https://rjmusic.vercel.app>
2. Click Login
3. Enter your credentials
4. You should stay on rjmusic.vercel.app (not redirect to localhost!)

---

## 🎉 Done

Your authentication redirects are now fixed. Users will stay on your production domain when logging in.
