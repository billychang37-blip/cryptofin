import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*, profiles(first_name, last_name, email, soft_token)')
      .eq('type', 'soft_token_purchase')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ tokens: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch tokens' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { txId, newStatus } = body;

    if (!txId || !newStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', txId)
      .single();

    if (txError || !tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (newStatus === 'processing') {
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', txId);
      
      if (updateError) throw updateError;
      return NextResponse.json({ success: true });
    }

    if (newStatus === 'completed') {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', tx.user_id)
        .single();

      if (profileError || !profile) throw new Error('User not found');

      const walletCol = tx.wallet_used === 'main' ? 'wallet_balance' : `${tx.wallet_used}_balance`;
      const currentBal = Number(profile[walletCol] || 0);
      const txAmount = Number(tx.amount);

      if (currentBal < txAmount) {
        return NextResponse.json({ error: 'Insufficient funds in user wallet' }, { status: 400 });
      }

      const generatedToken = Math.floor(100000 + Math.random() * 900000).toString();

      const profileUpdate = {
        [walletCol]: currentBal - txAmount,
        soft_token: generatedToken
      };

      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', tx.user_id);

      if (profileUpdateError) throw profileUpdateError;

      const { error: txUpdateError } = await supabaseAdmin
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', txId);

      if (txUpdateError) throw txUpdateError;

      return NextResponse.json({ success: true, token: generatedToken });
    }

    if (newStatus === 'rejected') {
      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({ status: newStatus })
        .eq('id', txId);
      
      if (updateError) throw updateError;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (err: any) {
    console.error(`Soft Token API Error: `, err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
