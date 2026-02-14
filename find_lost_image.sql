-- FIND LOST IMAGE: Search storage.objects for "Second Skin" or "Bandeau"
-- This will tell us if the file is still safely in the bucket.

DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Searching for files in storage.objects...';
    
    FOR r IN 
        SELECT bucket_id, name, created_at
        FROM storage.objects
        WHERE name ILIKE '%Second%Skin%' 
           OR name ILIKE '%Bandeau%'
           OR name ILIKE '%Seamless%'
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE 'Found: Bucket: %, Name: %, Created: %', r.bucket_id, r.name, r.created_at;
    END LOOP;
    
    -- Also list recent files just in case the name is weird (like a UUID)
    RAISE NOTICE 'Recent uploads (last 5):';
    FOR r IN 
        SELECT bucket_id, name, created_at
        FROM storage.objects
        WHERE bucket_id = 'products' -- Assuming bucket name 'products'
        ORDER BY created_at DESC
        LIMIT 5
    LOOP
        RAISE NOTICE 'Recent: Bucket: %, Name: %, Created: %', r.bucket_id, r.name, r.created_at;
    END LOOP;

END $$;
