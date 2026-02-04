# Fix Admin Access for <raffyjames@gmail.com>

## Problem

Cannot access admin page using <raffyjames@gmail.com> account.

## Solution

The `profiles` table needs to be created and your account needs to be set as admin.

---

## Steps to Fix

### 1. Open Supabase SQL Editor

1. Go to: <https://ytgwjbmmnkhcvrmaxrvs.supabase.co>
2. Navigate to **SQL Editor**
3. Click **New Query**

### 2. Run the Setup Script

1. Open the file: `setup_profiles_admin.sql`
2. Copy ALL the content
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press F5)

### 3. Verify the Result

At the bottom of the SQL output, you should see:

```
id: [your-user-id]
email: raffyjames@gmail.com
role: admin
created_at: [timestamp]
```

### 4. Test Admin Access

1. Go to <http://localhost:3000> (or <https://rjmusic.vercel.app>)
2. Login with <raffyjames@gmail.com>
3. You should now be redirected to `/admin/dashboard`
4. You can access all admin pages

---

## What This Script Does

1. ✅ Creates the `profiles` table
2. ✅ Sets up Row Level Security (RLS) policies
3. ✅ Creates a trigger to auto-create profiles for new users
4. ✅ Creates profiles for existing users
5. ✅ Sets <raffyjames@gmail.com> as **admin**
6. ✅ Verifies the setup

---

## Troubleshooting

### If you still can't access admin

1. **Clear browser cache and cookies**
2. **Logout and login again**
3. **Check the SQL output** - Make sure it shows `role: admin`
4. **Check browser console** for any errors

### To verify in SQL

```sql
SELECT u.email, p.role 
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'raffyjames@gmail.com';
```

Should return: `raffyjames@gmail.com | admin`

---

## Need to Add More Admins?

Run this SQL:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'another-email@example.com'
);
```

Replace `another-email@example.com` with the email address.
