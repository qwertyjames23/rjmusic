-- ALTER TABLE SCRIPT
-- This script adds the 'icon_name' column to your existing 'categories' table.

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS icon_name TEXT;

-- UPDATE EXISTING CATEGORIES WITH ICONS
-- This will add default icon names based on the category name.
-- You can change these later in the admin panel if needed.

UPDATE categories SET icon_name = 'Guitar' WHERE name = 'Guitars';
UPDATE categories SET icon_name = 'Piano' WHERE name = 'Keys';
UPDATE categories SET icon_name = 'Drum' WHERE name = 'Percussion';
UPDATE categories SET icon_name = 'Mic' WHERE name = 'Studio';
UPDATE categories SET icon_name = 'Headphones' WHERE name = 'Accessories';
