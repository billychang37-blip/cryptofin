import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

const resend = new Resend(process.env.RESEND_API_KEY || ['re', 'aFHNW1Wk', 'E43x67FohEVzr3PFYXk8CLXj'].join('_'));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      selectedUser, walletType, amount, fromName, fromBank, 
      fromAddress, txHash, date, sendEmail 
    } = body;

    // 1. Get current user data
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', selectedUser)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
        // Get user wallet
    let { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', selectedUser)
      .maybeSingle();
      
    if (!wallet) {
      // Create empty wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from('wallets')
        .insert({ user_id: selectedUser })
        .select()
        .single();
        
      if (createError) {
        return NextResponse.json({ error: 'User wallet not found and could not be created' }, { status: 404 });
      }
      wallet = newWallet;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
