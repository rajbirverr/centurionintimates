-- INSPECT: Check columns in order_items table
-- This helps us debug why 'price' column is missing.

DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '--- Columns in order_items ---';
    FOR r IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '% (%)', r.column_name, r.data_type;
    END LOOP;
    RAISE NOTICE '------------------------------';
END $$;
