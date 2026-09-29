export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  try {
    // We use the service role key to bypass RLS entirely so admins can see all data
    // (RLS usually blocks users from seeing other users' data)
    
    // Fetch all profiles using * to avoid crashes if IP columns aren't created yet
    const { data: users, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*');
      
    if (userError) throw userError;

    // Fetch all transactions
    const { data: txs, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*');
      
    if (txError) throw txError;

    return NextResponse.json({ users, txs });
  } catch (err: any) {
    console.error('Dashboard API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
