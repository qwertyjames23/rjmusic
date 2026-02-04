-- Make raffyjames@gmail.com an admin
-- Run this in your Supabase SQL Editor

-- First, let's check if the user exists
SELECT id, email, role 
FROM auth.users 
WHERE email = 'raffyjames@gmail.com';

-- Update the profile to admin role
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'raffyjames@gmail.com'
);

-- Verify the update
SELECT 
    u.id,
    u.email,
    p.role,
    p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'raffyjames@gmail.com';
