-- INSPECT V2: Deep dive into order_items
-- Please run this and look at the "Results" tab to see the columns.

SELECT * FROM "order_items" LIMIT 1;

-- Also checking if there's a difference in schema/naming
SELECT table_schema, table_name, column_name, data_type
FROM information_schema.columns 
WHERE table_name ILIKE '%order_item%'
ORDER BY table_name, ordinal_position;
