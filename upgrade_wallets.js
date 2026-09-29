const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '.env.local'});
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('wallets').select('user_id').is('trx_address', null);
  if (data) {
    for (let w of data) {
      try {
        const res = await fetch('http://localhost:3000/api/wallet/upgrade', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({userId: w.user_id}) });
        console.log('Upgraded', w.user_id, res.status);
      } catch(e) { console.error(e); }
    }
  }
}
run();
