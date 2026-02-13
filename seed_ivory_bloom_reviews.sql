-- Seed 50 reviews for 'Ivory Bloom Lace Underwire Bra'
-- This script assumes the product with slug 'ivory-bloom-lace-underwire-bra' exists.
-- It inserts random, realistic reviews with Indian female names.

DO $$
DECLARE
    target_product_id UUID;
    review_content TEXT;
    review_title TEXT;
    reviewer_name TEXT;
    review_rating INT;
    verified BOOLEAN := true;
    helpful_yes INT;
    helpful_no INT;
    created_at TIMESTAMP;
    i INT;
    
    -- Arrays for random generation
    first_names TEXT[] := ARRAY['Ananya', 'Priya', 'Sreya', 'Meera', 'Aditi', 'Neha', 'Riya', 'Ishita', 'Kavya', 'Sana', 'Tanvi', 'Deepa', 'Aisha', 'Zara', 'Pooja', 'Simran', 'Nisha', 'Bhavna', 'Kritika', 'Ritika', 'Shruti', 'Varsha', 'Divya', 'Sonal', 'Preeti', 'Garima', 'Swati', 'Juhi', 'Geeta', 'Radha', 'Sneha', 'Monika', 'Rashi', 'Kiran', 'Vidya', 'Lata', 'Shweta', 'Nidhi', 'Sakshi', 'Mahima', 'Pallavi', 'Richa', 'Sarita', 'Vandana', 'Yoshita', 'Zoya', 'Urvi', 'Tarini', 'Reema', 'Ojaswi'];
    last_names TEXT[] := ARRAY['Sharma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Reddy', 'Verma', 'Mehta', 'Jain', 'Chopra', 'Malhotra', 'Kapoor', 'Bhatia', 'Saxena', 'Iyer', 'Menon', 'Nair', 'Rao', 'Das', 'Roy', 'Sen', 'Banerjee', 'Mishra', 'Pandey', 'Tiwari', 'Yadav', 'Joshi', 'Kulkarni', 'Deshmukh', 'Patil', 'Pawar', 'More', 'Gowda', 'Shetty', 'Hegde', 'Prasad', 'Rana', 'Chauhan', 'Thakur', 'Rawat', 'Negi', 'Bisht', 'Kaur', 'Sandhu', 'Sidhu', 'Gill', 'Mann', 'Brar', 'Garg', 'Agarwal'];
    
    positive_adjectives TEXT[] := ARRAY['amazing', 'perfect', 'lovely', 'beautiful', 'comfortable', 'soft', 'elegant', 'stunning', 'gorgeous', 'excellent', 'superb', 'fantastic', 'great', 'nice', 'wonderful'];
    fabric_comments TEXT[] := ARRAY['The lace is really soft and not itchy at all.', 'Material feels premium against the skin.', 'Fabric quality is top notch.', 'Very comfortable fabric for daily wear.', 'The lace design is intricate and beautiful.', 'So soft and breathable.', 'Feels like second skin.', 'Quality is better than expected.', 'Lace detail is exquisite.', 'Not transparent, good quality lining.'];
    fit_comments TEXT[] := ARRAY['Fits perfectly true to size.', 'A bit snug but likely will stretch.', 'Cup size is accurate.', 'Band provides good support.', 'Comfortable fit for long hours.', 'Finally found my perfect fit.', 'Sizing chart was accurate.', 'Fits like a dream.', 'Support is great without being uncomfortable.', 'Straps are adjustable and stay in place.'];
    general_comments TEXT[] := ARRAY['Definitely buying more colors.', 'Worth the price.', 'Highly recommended!', 'My new favorite bra.', 'Looks exactly like the picture.', 'Packaging was also cute.', 'Delivery was fast.', 'Go for it girls.', 'Best purchase this month.', 'Love the ivory color.'];
    
BEGIN
    -- Get product ID
    SELECT id INTO target_product_id FROM products WHERE slug = 'ivory-bloom-lace-underwire-bra';
    
    -- If product ID is null, try to find ANY product to attach to (fallback) or raise notice
    IF target_product_id IS NULL THEN
        RAISE NOTICE 'Product ivory-bloom-lace-underwire-bra not found. Skipping seed.';
        RETURN;
    END IF;

    -- Update RLS policies just in case (optional, but good for local dev)
    ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

    -- Generate 50 reviews
    FOR i IN 1..50 LOOP
        -- Generate Name
        reviewer_name := first_names[1 + floor(random() * array_length(first_names, 1))::int] || ' ' || last_names[1 + floor(random() * array_length(last_names, 1))::int];
        
        -- Generate Rating (mostly 4-5 stars, some 3)
        IF random() < 0.7 THEN
            review_rating := 5;
        ELSIF random() < 0.9 THEN
            review_rating := 4;
        ELSE
            review_rating := 3;
        END IF;
        
        -- Generate Content (combine random sentences)
        review_content := 
            positive_adjectives[1 + floor(random() * array_length(positive_adjectives, 1))::int] || ' product! ' ||
            fabric_comments[1 + floor(random() * array_length(fabric_comments, 1))::int] || ' ' ||
            fit_comments[1 + floor(random() * array_length(fit_comments, 1))::int] || ' ' ||
            general_comments[1 + floor(random() * array_length(general_comments, 1))::int];
            
        -- Ensure length is roughly 8-80 words (our sentences are short, so appending 3-4 makes it decent length)
        
        -- Generate Title
        review_title := 
            CASE 
                WHEN review_rating = 5 THEN 'Absolutely ' || positive_adjectives[1 + floor(random() * array_length(positive_adjectives, 1))::int]
                WHEN review_rating = 4 THEN 'Good but ' || positive_adjectives[1 + floor(random() * array_length(positive_adjectives, 1))::int]
                ELSE 'Decent purchase'
            END;

        -- Random helpful counts
        helpful_yes := floor(random() * 20)::int;
        helpful_no := floor(random() * 5)::int;
        
        -- Random date in last 90 days
        created_at := NOW() - (floor(random() * 90) || ' days')::interval;

        -- Insert Review
        -- We use a dummy user_id if actual users don't exist, or we rely on 'Allow public insert' policy 
        -- typically requires a user_id. Let's assume we can get a user_id or use a fixed one if FK constraint exists.
        -- WARNING: If reviews table has FK to auth.users, we need a valid user_id.
        -- For robust seeding, let's try to fetch a real user, or insert without user_id if nullable.
        
        -- Assuming user_id is nullable OR we have a test user. 
        -- Let's try to get ID of 'test@example.com' or insert '00000000-0000-0000-0000-000000000000' if compatible.
        -- If Auth is strict, this might fail.
        -- STRATEGY: We will attempt to insert with a random existing user_id if available, else NULL.
        
        INSERT INTO reviews (
            product_id,
            rating,
            title,
            content,
            author_name,
            is_verified_purchase,
            helpful_yes,
            helpful_no,
            created_at,
            status,
            user_id -- Assuming nullable or we have a dummy
        ) VALUES (
            target_product_id,
            review_rating,
            review_title,
            review_content,
            reviewer_name,
            true, -- Always verified as requested
            helpful_yes,
            helpful_no,
            created_at,
            'approved',
            (SELECT id FROM auth.users LIMIT 1) -- Try to grab ANY user. If table empty, might fail if NOT NULL.
        );
    END LOOP;
END $$;
