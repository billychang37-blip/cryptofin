const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const keyStr = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const key = keyStr.replace(/^"|"$/g, '');

const supabaseAdmin = createClient(url, key);

async function check() {
  const { data, error } = await supabaseAdmin.from('wallets').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  }
}
check();
