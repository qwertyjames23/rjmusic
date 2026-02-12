-- Add admin policy to allow admin to delete any review
-- This is needed so that when an admin deletes a product,
-- the associated reviews can be cleaned up first.
-- First, check if the admin email is stored in profiles or use a direct check
-- Using a direct email check approach:
-- Option 1: Allow admin (by email) to delete any review
CREATE POLICY "Admin can delete any review" ON reviews FOR DELETE USING (
    auth.jwt()->>'email' = current_setting('app.admin_email', true)
    OR auth.uid() = user_id
);
-- If the above doesn't work due to current_setting not being available,
-- use this hardcoded version instead (replace with your admin email):
-- DROP POLICY IF EXISTS "Admin can delete any review" ON reviews;
-- DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
-- CREATE POLICY "Users and admin can delete reviews" ON reviews
--   FOR DELETE USING (
--     auth.uid() = user_id
--     OR auth.jwt() ->> 'email' = 'raffyjames65@gmail.com'
--   );
-- RECOMMENDED: Run this in Supabase SQL Editor:
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (
    auth.uid() = user_id
    OR auth.jwt()->>'email' = 'raffyjames65@gmail.com'
);