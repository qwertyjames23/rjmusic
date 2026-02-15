-- Add unique constraint on idempotency_key to prevent duplicate orders from race conditions.
-- Run this in Supabase SQL Editor.
ALTER TABLE orders ADD CONSTRAINT orders_idempotency_key_unique UNIQUE (idempotency_key);
