-- Set admin role for the primary admin user (raffyjames65@gmail.com)
-- This fixes email/password login redirect to /admin/dashboard
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'raffyjames65@gmail.com'
);
