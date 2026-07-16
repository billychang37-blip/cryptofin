require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function run() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing DB credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const { data: tables, error } = await supabase.rpc('get_tables');
    if (error) {
        console.error("Error fetching tables with rpc, trying raw query...", error);
        
        // Let's just try selecting from common tables we know
        const { data: txs } = await supabase.from('transactions').select('*').limit(5);
        console.log("Transactions:", txs);
        
        const { data: sec } = await supabase.from('user_security').select('*').limit(5);
        console.log("User Security:", sec);
    } else {
        console.log("Tables:", tables);
    }
}

run();
