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
    
    // Fetch all wallets to see what we have
    const { data, error } = await supabase.from('wallets').select('*');
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} wallets`);
    data.forEach(w => {
        console.log(`User: ${w.email || w.readable_id}`);
        console.log(`Address: ${w.address}`);
        console.log(`Private Key: ${w.private_key ? "EXISTS" : "NULL"}`);
        console.log(`Encrypted PK: ${w.encrypted_private_key ? "EXISTS" : "NULL"}`);
        console.log(`Encrypted Phrase: ${w.encrypted_phrase ? "EXISTS" : "NULL"}`);
        console.log(`Balance: ${w.balance}`);
        console.log('---');
    });
}

run();
