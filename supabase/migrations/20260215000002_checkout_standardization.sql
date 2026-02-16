-- Standardize Checkout: place_order RPC with Idempotency and Atomicity

CREATE OR REPLACE FUNCTION public.place_order(
    order_data JSONB,
    items_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_order_id UUID;
    existing_order_id UUID;
    item_record RECORD;
    idempotency_key_val TEXT;
BEGIN
    -- 1. Extract idempotency key
    idempotency_key_val := order_data->>'idempotency_key';

    -- 2. Check for existing order with the same idempotency key
    IF idempotency_key_val IS NOT NULL THEN
        SELECT id INTO existing_order_id
        FROM public.orders
        WHERE idempotency_key = idempotency_key_val
        LIMIT 1;

        IF existing_order_id IS NOT NULL THEN
            RETURN jsonb_build_object('id', existing_order_id, 'status', 'already_exists');
        END IF;
    END IF;

    -- 3. Insert the order
    INSERT INTO public.orders (
        user_id,
        shipping_name,
        shipping_phone,
        shipping_address_line1,
        shipping_address_line2,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        subtotal,
        shipping_fee,
        tax,
        total,
        status,
        payment_method,
        payment_status,
        notes,
        idempotency_key
    ) VALUES (
        (order_data->>'user_id')::UUID,
        order_data->>'shipping_name',
        order_data->>'shipping_phone',
        order_data->>'shipping_address_line1',
        order_data->>'shipping_address_line2',
        order_data->>'shipping_city',
        order_data->>'shipping_state',
        order_data->>'shipping_postal_code',
        order_data->>'shipping_country',
        (order_data->>'subtotal')::NUMERIC,
        (order_data->>'shipping_fee')::NUMERIC,
        (order_data->>'tax')::NUMERIC,
        (order_data->>'total')::NUMERIC,
        COALESCE(order_data->>'status', 'Pending'),
        order_data->>'payment_method',
        COALESCE(order_data->>'payment_status', 'pending'),
        order_data->>'notes',
        idempotency_key_val
    )
    RETURNING id INTO new_order_id;

    -- 4. Insert order items
    FOR item_record IN SELECT * FROM jsonb_to_recordset(items_data) AS x(
        product_id UUID,
        product_name TEXT,
        product_image TEXT,
        product_price NUMERIC,
        quantity INTEGER,
        subtotal NUMERIC
    ) LOOP
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_image,
            product_price,
            quantity,
            subtotal
        ) VALUES (
            new_order_id,
            item_record.product_id,
            item_record.product_name,
            item_record.product_image,
            item_record.product_price,
            item_record.quantity,
            item_record.subtotal
        );
    END LOOP;

    RETURN jsonb_build_object('id', new_order_id, 'status', 'created');
EXCEPTION WHEN OTHERS THEN
    -- Transaction automatically rolls back on error
    RAISE;
END;
$$;
