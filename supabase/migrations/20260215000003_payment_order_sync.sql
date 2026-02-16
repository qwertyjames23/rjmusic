-- Payment to Order Status Sync Trigger

-- 1. Create the function to handle the status sync
CREATE OR REPLACE FUNCTION public.sync_order_status_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If payment_status is updated to 'paid'
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        -- And if the order is still in 'Pending' status
        IF NEW.status = 'Pending' THEN
            NEW.status := 'Processing';
            
            -- Log the automatic status change (if the log table exists)
            BEGIN
                INSERT INTO public.order_status_logs (
                    order_id,
                    old_status,
                    new_status,
                    changed_by_user_id,
                    changed_by_email
                ) VALUES (
                    NEW.id,
                    'Pending',
                    'Processing',
                    NULL, -- System automated
                    'system-payment-sync@rjmusic.com'
                );
            EXCEPTION WHEN OTHERS THEN
                -- If the log table doesn't exist or insert fails, just ignore it
                NULL;
            END;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 2. Attach the trigger to the orders table
DROP TRIGGER IF EXISTS on_order_payment_update ON public.orders;
CREATE TRIGGER on_order_payment_update
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_status_on_payment();
