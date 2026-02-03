# Database Setup Guide

This guide will help you set up Supabase and Cloudinary for the RJ Music e-commerce application.

---

## Prerequisites

- Supabase account ([sign up here](https://supabase.com))
- Cloudinary account ([sign up here](https://cloudinary.com))
- Environment variables configured in `.env.local`

---

## Part 1: Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: rjmusic (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for project to finish setting up (~2 minutes)

### Step 2: Get API Credentials

1. In your project dashboard, click **Settings** (gear icon) in sidebar
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Update Environment Variables

Open `.env.local` and verify these values match your Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Initialize Database Schema

1. In Supabase Dashboard, click **SQL Editor** in sidebar
2. Click **New Query**
3. Open the file `database_init.sql` from your project root
4. Copy the **entire contents** of that file
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see: ✅ Success message

**What this does:**

- Creates `products`, `orders`, and `order_items` tables
- Sets up Row Level Security (RLS) policies
- Inserts 6 sample products

### Step 5: Verify Database Setup

1. Click **Table Editor** in sidebar
2. You should see three tables:
   - `products` (should have 6 rows)
   - `orders` (empty)
   - `order_items` (empty)

---

## Part 2: Cloudinary Image Upload Setup

### Step 1: Get Cloudinary Credentials

1. Go to [Cloudinary Console](https://console.cloudinary.com/)
2. From the dashboard, copy:
   - **Cloud Name** → Already in `.env.local` as `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → Already in `.env.local` as `CLOUDINARY_API_KEY`
   - **API Secret** → Already in `.env.local` as `CLOUDINARY_API_SECRET`

### Step 2: Create Upload Preset

**This is CRITICAL for image uploads to work!**

1. In Cloudinary Console, click **Settings** (gear icon)
2. Navigate to **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: `rjmusic_preset` (must match exactly!)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: (optional) `rjmusic` or leave blank
   - **Use filename**: Toggle ON (recommended)
   - **Unique filename**: Toggle ON (recommended)
6. Click **Save**

### Step 3: Verify Upload Preset

1. In Upload presets list, find `rjmusic_preset`
2. Verify **Signing Mode** shows "Unsigned"
3. Note the preset name matches exactly what's in `src/components/ui/image-upload.tsx` (line 48)

---

## Part 3: Enable Google OAuth (Optional)

If you want Google login to work:

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application type**: Web application
   - **Authorized redirect URIs**: Add:

     ```
     https://your-project-id.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```

6. Copy **Client ID** and **Client Secret**

### Step 2: Configure in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** and toggle it ON
3. Paste your **Client ID** and **Client Secret**
4. Click **Save**

---

## Part 4: Verification Checklist

Run through these checks to ensure everything is working:

### Database Checks

- [ ] Can access Supabase dashboard
- [ ] `products` table has 6 sample products
- [ ] `orders` and `order_items` tables exist
- [ ] RLS policies are enabled (check Table Editor → RLS tab)

### Application Checks

- [ ] Run `npm run dev` successfully
- [ ] Home page displays products from database (not "Fallback data")
- [ ] Navbar search finds real products
- [ ] Can navigate to `/admin/products` and see product list
- [ ] Can navigate to `/admin/product/new` to create product

### Image Upload Checks

- [ ] Cloudinary upload preset `rjmusic_preset` exists
- [ ] Preset is set to "Unsigned" mode
- [ ] Can click image upload widget in admin product form
- [ ] Can upload an image successfully
- [ ] Image URL is saved and preview appears

### Order Flow Checks

- [ ] Can add products to cart
- [ ] Can navigate to `/cart` (requires login)
- [ ] Can proceed to `/checkout`
- [ ] Can place an order
- [ ] Order appears in Supabase `orders` table
- [ ] Order items appear in `order_items` table
- [ ] Order appears in `/admin/orders` page

---

## Troubleshooting

### "Failed to fetch products" Error

**Cause**: Supabase connection issue

**Solutions**:

1. Verify `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Restart dev server: `npm run dev`
3. Check Supabase project is not paused (free tier pauses after inactivity)

### "Upload preset not found" Error

**Cause**: Cloudinary preset doesn't exist or name mismatch

**Solutions**:

1. Verify preset name is exactly `rjmusic_preset` (case-sensitive)
2. Verify preset is set to "Unsigned" mode
3. Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in `.env.local` is correct

### "Row Level Security policy violation" Error

**Cause**: RLS policies not configured correctly

**Solutions**:

1. Re-run the `database_init.sql` script in Supabase SQL Editor
2. Check Table Editor → Select table → RLS tab → Verify policies exist

### Products show "Fallback data" message

**Cause**: Database is empty or connection failed

**Solutions**:

1. Check `products` table has data (Table Editor)
2. If empty, re-run `database_init.sql` to insert seed data
3. Check browser console for errors

---

## Next Steps

Once setup is complete:

1. **Test the application**: Go through the entire user flow (browse → add to cart → checkout)
2. **Add real products**: Use `/admin/product/new` to add your actual inventory
3. **Customize seed data**: Edit `database_init.sql` to match your products
4. **Deploy**: When ready, deploy to Vercel and update OAuth redirect URLs

---

## Support

If you encounter issues:

1. Check browser console for errors (F12)
2. Check Supabase logs (Dashboard → Logs)
3. Verify all environment variables are set correctly
4. Ensure database schema is initialized

**Database Schema Reference**: See `database_init.sql` for complete table structure and policies.
