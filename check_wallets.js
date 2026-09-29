const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkWallets() {
  const { data, error } = await supabase.from('wallets').select('id, user_id, hd_index, trx_address').limit(10);
  console.log(data);
}
checkWallets();
