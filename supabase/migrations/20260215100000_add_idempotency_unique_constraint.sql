-- Add unique constraint on idempotency_key to prevent duplicate orders from race conditions.
-- If the constraint already exists, this will be a no-op.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_idempotency_key_unique'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_idempotency_key_unique UNIQUE (idempotency_key);
    END IF;
END $$;
