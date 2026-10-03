const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
for (const line of envLocal.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
}
if (!key) {
    for (const line of envLocal.split('\n')) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
    }
}

const supabase = createClient(url, key);

async function run() {
    const { data } = await supabase.from('transactions').select('id, type, amount, status, created_at').order('created_at', { ascending: false }).limit(5);
    console.log(data);
}
run();
