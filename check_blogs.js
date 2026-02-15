
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogs() {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString());

    if (error) {
        console.error('Error fetching blogs:', error);
    } else {
        console.log(`Found ${data.length} published blogs.`);
        if (data.length > 0) {
            console.log('Sample blog:', data[0]);
        }
    }
}

checkBlogs();
