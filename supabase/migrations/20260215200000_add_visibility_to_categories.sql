-- Add visibility toggle column to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
