export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'deposit' or 'withdrawal'

    let query = supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (type === 'deposit') {
      query = query.in('type', ['deposit', 'crypto_deposit']);
    } else if (type === 'withdrawal') {
      query = query.lt('amount', 0);
    }

    const { data: txs, error: txError } = await query;
    if (txError) throw txError;

    // Fetch all profiles so we can manually join them, since Supabase complains about missing FKs
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, email, wallet_balance, total_assets');
    
    if (profileError) throw profileError;

    const mergedData = (txs || []).map(tx => {
      const userProfile = (profiles || []).find(p => p.id === tx.user_id);
      return {
        ...tx,
        profiles: userProfile || null
      };
    });

    return NextResponse.json(mergedData);
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
