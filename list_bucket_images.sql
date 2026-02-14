-- LIST BUCKET: List all files in the 'images' bucket.
-- Hopefully we can spot the familiar filename.

DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Searching for files in storage.objects (bucket_id = "images")...';
    
    FOR r IN 
        SELECT name, created_at, metadata
        FROM storage.objects
        WHERE bucket_id = 'images'
        AND name LIKE 'products/%'
        ORDER BY created_at DESC
        LIMIT 50
    LOOP
        RAISE NOTICE 'File: %, Created: %', r.name, r.created_at;
    END LOOP;

END $$;
