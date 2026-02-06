-- Create a function to handle order placement with stock deduction
CREATE OR REPLACE FUNCTION place_order(
  order_data JSONB,
  items_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (usually admin) to allow updating product stock
AS $$
DECLARE
  new_order orders;
  item_record JSONB;
  current_stock INT;
  product_id UUID;
  qty INT;
BEGIN
  -- 1. Create the Order
  INSERT INTO orders (
    user_id,
    order_number, -- Trigger will handle this, but we insert the rest
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
    notes
  ) VALUES (
    (order_data->>'user_id')::UUID,
    (order_data->>'order_number'), -- Pass empty string or handle in trigger
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
    order_data->>'status',
    order_data->>'payment_method',
    order_data->>'payment_status',
    order_data->>'notes'
  ) RETURNING * INTO new_order;

  -- 2. Loop through items
  FOR item_record IN SELECT * FROM jsonb_array_elements(items_data)
  LOOP
    product_id := (item_record->>'product_id')::UUID;
    qty := (item_record->>'quantity')::INT;

    -- Check Stock
    SELECT stock INTO current_stock FROM products WHERE id = product_id FOR UPDATE;
    
    IF current_stock < qty THEN
      RAISE EXCEPTION 'Insufficient stock for product ID %', product_id;
    END IF;

    -- Deduct Stock
    UPDATE products SET stock = stock - qty WHERE id = product_id;

    -- Insert Order Item
    INSERT INTO order_items (
      order_id,
      product_id,
      product_name,
      product_image,
      product_price,
      quantity,
      subtotal
    ) VALUES (
      new_order.id,
      product_id,
      item_record->>'product_name',
      item_record->>'product_image',
      (item_record->>'product_price')::NUMERIC,
      qty,
      (item_record->>'subtotal')::NUMERIC
    );
  END LOOP;

  -- Return the new order
  RETURN to_jsonb(new_order);
END;
$$;
