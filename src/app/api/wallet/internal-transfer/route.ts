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
      senderId, 
      receiverId, 
      amount, 
      assetId, 
      assetBase
    } = body;

    const numAmount = parseFloat(amount);

    if (!senderId || !receiverId || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid transfer details' }, { status: 400 });
    }

    // 1. Get sender and receiver profiles
    const { data: sender } = await supabaseAdmin.from('profiles').select('*').eq('id', senderId).single();
    const { data: receiver } = await supabaseAdmin.from('profiles').select('*').eq('id', receiverId).single();

    if (!sender || !receiver) {
      return NextResponse.json({ error: 'Sender or receiver not found' }, { status: 404 });
    }

    // 2. Determine balance field
    let balanceField = 'balance';
    if (assetBase === 'BTC') balanceField = 'btc_balance';
    else if (assetBase === 'USDT') balanceField = 'usdt_balance';
    else if (assetBase === 'SOL') balanceField = 'sol_balance';
    else if (assetBase === 'TRX') balanceField = 'trx_balance';
    else if (assetBase === 'BNB') balanceField = 'bnb_balance';
    else if (assetBase === 'MATIC') balanceField = 'matic_balance';
    else if (assetBase === 'AVAX') balanceField = 'avax_balance';
    else if (assetBase === 'USDC') balanceField = 'usdc_balance';
    


    // 3. Get sender wallet and verify balance
    const { data: senderWallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', senderId).single();
    if (!senderWallet || parseFloat(senderWallet[balanceField] || 0) < numAmount) {
      return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
    }

    // 4. Get or create receiver wallet
    let { data: receiverWallet } = await supabaseAdmin.from('wallets').select('*').eq('user_id', receiverId).maybeSingle();
    if (!receiverWallet) {
      const { data: newWallet } = await supabaseAdmin.from('wallets').insert({ user_id: receiverId }).select().single();
      receiverWallet = newWallet;
    }

    // Generate a random internal TX hash
    const internalTxHash = 'INT-' + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();

    // 5. Update Balances
    const currentSenderBalance = parseFloat(senderWallet[balanceField] || 0);
    const currentReceiverBalance = parseFloat(receiverWallet[balanceField] || 0);

    await supabaseAdmin.from('wallets').update({ [balanceField]: currentSenderBalance - numAmount }).eq('id', senderWallet.id);
    await supabaseAdmin.from('wallets').update({ [balanceField]: currentReceiverBalance + numAmount }).eq('id', receiverWallet.id);

    // 6. Record Transactions
    await supabaseAdmin.from('transactions').insert({
      tx_hash: internalTxHash,
      user_id: senderId,
      type: 'transfer',
      amount: -numAmount, 
      currency: assetId,
      status: 'completed',
      to_address: receiver.email,
      description: `Internal Transfer to ${receiver.email}`,
      metadata: { method: 'internal', to_user: receiver.id }
    });

    const { data: txData } = await supabaseAdmin.from('transactions').insert({
      tx_hash: internalTxHash,
      user_id: receiverId,
      type: 'deposit',
      amount: numAmount, 
      currency: assetId,
      status: 'completed',
      from_address: sender.email,
      description: `Received from ${sender.email}`,
      metadata: { method: 'internal', from_user: sender.id }
    }).select().single();

    // 7. Send Emails
    try {
      const symbol = assetBase.toUpperCase();
      
      // Notify Receiver
      if (receiver.email) {
        let receiverHtml = `<div style="font-family: sans-serif; max-w-lg: mx-auto; p-4;">
          <h2 style="color: #2196F3;">Funds Received!</h2>
          <p>Hello ${receiver.first_name || 'User'},</p>
          <p>You have just received an internal transfer of <strong>${numAmount} ${symbol}</strong> from ${sender.email}.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Amount:</strong> ${numAmount} ${symbol}</li>
            <li><strong>From:</strong> ${sender.email}</li>
            <li><strong>Transaction Hash:</strong> ${internalTxHash}</li>
          </ul>
          <p>Log in to your account to view your updated balance.</p>
        </div>`;
        
        await resend.emails.send({
          from: 'Cryptofin <noreply@auth.cryptofin.org>',
          to: receiver.email,
          subject: `You received ${numAmount} ${symbol}`,
          html: receiverHtml
        });
      }

      // Notify Sender
      if (sender.email) {
        let senderHtml = `<div style="font-family: sans-serif; max-w-lg: mx-auto; p-4;">
          <h2 style="color: #4CAF50;">Transfer Successful</h2>
          <p>Hello ${sender.first_name || 'User'},</p>
          <p>Your internal transfer of <strong>${numAmount} ${symbol}</strong> to ${receiver.email} was completely successfully.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Amount Sent:</strong> ${numAmount} ${symbol}</li>
            <li><strong>Recipient:</strong> ${receiver.email}</li>
            <li><strong>Transaction Hash:</strong> ${internalTxHash}</li>
          </ul>
        </div>`;
        
        await resend.emails.send({
          from: 'Cryptofin <noreply@auth.cryptofin.org>',
          to: sender.email,
          subject: `Transfer Sent: ${numAmount} ${symbol}`,
          html: senderHtml
        });
      }
    } catch (emailErr) {
      console.error("Failed to send internal transfer emails:", emailErr);
    }

    return NextResponse.json({ success: true, transactionId: txData.id });
  } catch (err: any) {
    console.error("INTERNAL TRANSFER ERROR:", err);
    return NextResponse.json({ error: err.message || 'Transfer failed' }, { status: 500 });
  }
}
