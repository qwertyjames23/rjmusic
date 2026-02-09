-- Drop foreign key constraint on reviews if it prevents deleting orders
-- and recreate it with ON DELETE CASCADE so reviews are automatically deleted when an order is deleted.

ALTER TABLE "reviews"
DROP CONSTRAINT "reviews_order_id_fkey";

ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_order_id_fkey"
FOREIGN KEY ("order_id")
REFERENCES "orders" ("id")
ON DELETE CASCADE;

-- Also verify if there are other tables like order_items that need this
-- (Usually order_items already has cascade, but let's be safe if we want to add it to script later)
