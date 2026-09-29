const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const keyStr = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const key = keyStr.replace(/^"|"$/g, '');

const supabaseAdmin = createClient(url, key);

async function alterTable() {
  const { error } = await supabaseAdmin.rpc('exec_sql', { 
    query: "ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS seed_phrase TEXT;" 
  });
  console.log("RPC result:", error ? error.message : "Success via RPC");
  
  if (error && error.message.includes('function "exec_sql" does not exist')) {
     console.log("No exec_sql RPC available. Need to write a script for user or create postgres function.");
  }
}
alterTable();
