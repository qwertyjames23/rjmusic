-- QUICK FIX: Make raffyjames@gmail.com admin
-- If profiles table already exists, just run this:

UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'raffyjames@gmail.com'
);

-- Verify:
SELECT u.email, p.role 
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'raffyjames@gmail.com';
