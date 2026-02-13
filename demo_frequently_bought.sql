-- DEMO: Generate Frequently Bought Together Data (v6 - With Images!)
-- This script does everything:
-- 1. Picks 3 products
-- 2. ENSURES they have images (updates them if null)
-- 3. Creates the order
-- 4. Runs the association logic

DO $$
DECLARE
    -- Variables to hold product data
    p1_id UUID;
    p1_name TEXT;
    p1_price NUMERIC;
    
    p2_id UUID;
    p2_name TEXT;
    p2_price NUMERIC;
    
    p3_id UUID;
    p3_name TEXT;
    p3_price NUMERIC;
    
    new_order_id UUID;
    new_order_number TEXT;
BEGIN
    -- 1. Get 3 random products
    SELECT id, name, price INTO p1_id, p1_name, p1_price FROM products ORDER BY random() LIMIT 1;
    SELECT id, name, price INTO p2_id, p2_name, p2_price FROM products WHERE id <> p1_id ORDER BY random() LIMIT 1;
    SELECT id, name, price INTO p3_id, p3_name, p3_price FROM products WHERE id NOT IN (p1_id, p2_id) ORDER BY random() LIMIT 1;

    RAISE NOTICE 'Selected Products for Demo Order:';
    RAISE NOTICE '1. % (ID: %)', p1_name, p1_id;
    RAISE NOTICE '2. % (ID: %)', p2_name, p2_id;
    RAISE NOTICE '3. % (ID: %)', p3_name, p3_id;
    
    -- 1.5 UPDATE IMAGES so they show up in carousel!
    -- Using placeholder images if they are missing
    UPDATE products SET images = ARRAY['https://picsum.photos/seed/p1/400/600'] WHERE id = p1_id AND (images IS NULL OR array_length(images, 1) IS NULL);
    UPDATE products SET images = ARRAY['https://picsum.photos/seed/p2/400/600'] WHERE id = p2_id AND (images IS NULL OR array_length(images, 1) IS NULL);
    UPDATE products SET images = ARRAY['https://picsum.photos/seed/p3/400/600'] WHERE id = p3_id AND (images IS NULL OR array_length(images, 1) IS NULL);

    
    -- Generate order number
    new_order_number := 'DEMO-' || floor(random() * 1000000)::text;

    -- 2. Create a Mock Order
    INSERT INTO orders (
        order_number,
        customer_email, 
        customer_name, 
        subtotal, 
        shipping_cost, 
        tax, 
        total, 
        status, 
        payment_status,
        -- Shipping Address (Flattened)
        shipping_address_line1,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        -- JSON columns
        shipping_address,
        billing_address
    ) VALUES (
        new_order_number,
        'demo@example.com', 
        'Demo User', 
        (p1_price + p2_price + p3_price), 
        0, 
        0, 
        (p1_price + p2_price + p3_price), 
        'delivered', 
        'paid',
        -- Shipping Values
        '123 Demo St',
        'Demo City',
        'Demo State',
        '12345',
        'India',
        -- JSON Values
        '{"line1": "123 Demo St", "city": "Demo City", "state": "Demo State", "country": "India", "postal_code": "12345"}'::jsonb,
        '{"line1": "123 Demo St", "city": "Demo City", "state": "Demo State", "country": "India", "postal_code": "12345"}'::jsonb
    ) RETURNING id INTO new_order_id;

    RAISE NOTICE 'Created Demo Order ID: % (Order Number: %)', new_order_id, new_order_number;

    -- 3. Add Items to Order (This links them together!)
    -- Corrected columns based on user inspection: unit_price, total_price
    INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES 
    (new_order_id, p1_id, p1_name, 1, p1_price, p1_price),
    (new_order_id, p2_id, p2_name, 1, p2_price, p2_price),
    (new_order_id, p3_id, p3_name, 1, p3_price, p3_price);

    -- 4. Run the Brain! 🧠
    PERFORM calculate_frequently_bought();
    
    RAISE NOTICE 'Ran calculate_frequently_bought() successfully.';

END $$;

-- 5. Show the results!
SELECT 
    p.name as "Main Product",
    ap.name as "Recommended (Frequently Bought)",
    pa.type as "Association Type",
    pa.score as "Score (Purchase Count)"
FROM product_associations pa
JOIN products p ON pa.product_id = p.id
JOIN products ap ON pa.associated_product_id = ap.id
WHERE pa.type = 'auto'
ORDER BY pa.created_at DESC
LIMIT 10;
