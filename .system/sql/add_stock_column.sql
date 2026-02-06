-- 1. Add 'stock' column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 2. Ensure 'in_stock' exists (it likely does, but just in case)
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT false;

-- 3. Create a Function to keep 'in_stock' synced with 'stock' count
CREATE OR REPLACE FUNCTION sync_stock_status() 
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set in_stock to true if stock > 0, else false
    NEW.in_stock := NEW.stock > 0;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create the Trigger
DROP TRIGGER IF EXISTS trigger_sync_stock_status ON products;

CREATE TRIGGER trigger_sync_stock_status
BEFORE INSERT OR UPDATE OF stock ON products
FOR EACH ROW
EXECUTE FUNCTION sync_stock_status();

-- 5. Backfill/Initialize existing rows
-- If stock is 0 but in_stock is true, we might want to default stock to a generic number? 
-- For now, let's just ensure rows with existing stock have synced booleans.
-- Or just set stock to 0 if null.
UPDATE products SET stock = 0 WHERE stock IS NULL;
