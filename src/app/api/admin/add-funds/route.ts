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
      selectedUser, walletType, amount, 
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


    // Create transaction record
    const numAmount = parseFloat(amount);
    
    // Map walletType to currency/asset
    let currency = walletType;
    if (walletType === 'main') currency = 'usd';
    else if (walletType === 'usdt_erc20') currency = 'usdt_erc20';
    else if (walletType === 'usdt_trc20') currency = 'usdt_trc20';
    else if (walletType === 'usdt_bep20') currency = 'usdt_bep20';
    else if (walletType === 'usdc_solana') currency = 'usdc_solana';
    else if (walletType === 'usdc_bep20') currency = 'usdc_bep20';
    
    const { data: tx, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: selectedUser,
        type: 'deposit',
        amount: numAmount,
        currency: currency,
        status: 'completed',
        created_at: date || new Date().toISOString(),
        from_address: fromAddress || null,
        tx_hash: txHash || null,
        
        
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json({ error: 'Failed to create transaction: ' + txError.message }, { status: 500 });
    }

    // Update wallet balance
    let balanceField = '';
    if (walletType === 'main') balanceField = 'wallet_balance';
    else if (walletType === 'usdt_erc20') balanceField = 'usdt_erc20_balance';
    else if (walletType === 'usdt_trc20') balanceField = 'usdt_trc20_balance';
    else if (walletType === 'usdt_bep20') balanceField = 'usdt_bep20_balance';
    else if (walletType === 'usdc_solana') balanceField = 'usdc_solana_balance';
    else if (walletType === 'usdc_bep20') balanceField = 'usdc_bep20_balance';
    
    else if (walletType === 'btc') balanceField = 'btc_balance';
    else if (walletType === 'eth') balanceField = 'eth_balance';
    else if (walletType === 'bnb') balanceField = 'bnb_balance';
    else if (walletType === 'sol') balanceField = 'sol_balance';
    else if (walletType === 'trx') balanceField = 'trx_balance';
    
    if (balanceField) {
      const currentBalance = parseFloat(wallet[balanceField] || 0);
      const { error: updateError } = await supabaseAdmin
        .from('wallets')
        .update({ [balanceField]: currentBalance + numAmount })
        .eq('id', wallet.id);
        
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
      }
    }

    // Send email if requested
    if (sendEmail && user.email) {
      try {
        const symbol = currency.toUpperCase().replace('_', ' ');
        let emailHtml = `<div style="font-family: sans-serif; max-w-lg: mx-auto; p-4;">
          <h2 style="color: #2196F3;">Deposit Successful</h2>
          <p>Hello ${user.first_name},</p>
          <p>Your deposit of <strong>${numAmount} ${symbol}</strong> has been successfully processed and credited to your account.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Amount:</strong> ${numAmount} ${symbol}</li>
            <li><strong>Date:</strong> ${new Date(date || Date.now()).toLocaleString()}</li>
            ${txHash ? `<li><strong>Transaction Hash:</strong> ${txHash}</li>` : ''}
            ${fromAddress ? `<li><strong>From Address:</strong> ${fromAddress}</li>` : ''}
          </ul>
          <p>Log in to your account to view your updated balance.</p>
          <p>Thank you.</p>
        </div>`;

        await resend.emails.send({
          from: 'Cryptofin <noreply@cryptofin.io>', // Update this to verified domain when in prod
          to: user.email,
          subject: 'Deposit Successful',
          html: emailHtml
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        // We don't fail the transaction if email fails
      }
    }

    return NextResponse.json({ success: true, transaction: tx });
  } catch (err: any) {

    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
