-- ==========================================
-- PROFILES TABLE SETUP & ADMIN ASSIGNMENT
-- ==========================================
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'customer', -- 'customer' or 'admin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for profiles
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 4. Create a function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        'customer' -- Default role
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to call function on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create profiles for existing users (if any)
INSERT INTO profiles (id, email, role)
SELECT 
    id,
    email,
    'customer' -- Default role for existing users
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 7. Make raffyjames@gmail.com an ADMIN
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'raffyjames@gmail.com'
);

-- 8. Verify the setup
SELECT 
    u.id,
    u.email,
    p.role,
    p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'raffyjames@gmail.com';

-- ==========================================
-- EXPECTED RESULT:
-- You should see raffyjames@gmail.com with role = 'admin'
-- ==========================================
