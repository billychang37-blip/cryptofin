
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailCompletedDeposit } from '@/lib/emails';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

const formatNetwork = (currency: string) => {
    if (!currency) return 'Unknown';
    if (currency === 'USDT' || currency === 'USDC' || currency.includes('ERC20')) return 'Ethereum (ERC20)';
    if (currency.includes('_TRX') || currency.includes('TRC20')) return 'Tron (TRC20)';
    if (currency.includes('_BNB') || currency.includes('BEP20')) return 'BNB Smart Chain (BEP20)';
    if (currency.includes('_SOL') || currency.includes('SOLANA')) return 'Solana';
    if (currency.includes('_MATIC') || currency.includes('POLYGON')) return 'Polygon';
    if (currency.includes('_AVAX') || currency.includes('AVALANCHE')) return 'Avalanche';
    if (currency === 'BTC') return 'Bitcoin';
    if (currency === 'ETH') return 'Ethereum';
    if (currency === 'SOL') return 'Solana';
    return 'Unknown';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      selectedUser, walletType, amount, 
      fromAddress, txHash, date, sendEmail: shouldSendEmail 
    } = body;
    
    if (!selectedUser) {
        return NextResponse.json({ error: 'No user selected' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    
    let currency = walletType;
    if (walletType === 'usdt_erc20') currency = 'USDT';
    else if (walletType === 'usdt_trc20') currency = 'USDT_TRX';
    else if (walletType === 'usdt_bep20') currency = 'USDT_BNB';
    else if (walletType === 'usdt_sol') currency = 'USDT_SOL';
    else if (walletType === 'usdt_matic') currency = 'USDT_MATIC';
    else if (walletType === 'usdt_avax') currency = 'USDT_AVAX';
    else if (walletType === 'usdc_solana') currency = 'USDC_SOL';
    else if (walletType === 'usdc_bep20') currency = 'USDC_BNB';
    else if (walletType === 'btc') currency = 'BTC';
    else if (walletType === 'eth') currency = 'ETH';
    else if (walletType === 'bnb') currency = 'BNB';
    else if (walletType === 'sol') currency = 'SOL';
    else if (walletType === 'trx') currency = 'TRX';
    else if (walletType === 'matic') currency = 'MATIC';
    else if (walletType === 'avax') currency = 'AVAX';

    let balanceField = '';
    if (walletType === 'usdt_erc20') balanceField = 'usdt_erc20_balance';
    else if (walletType === 'usdt_trc20') balanceField = 'usdt_trc20_balance';
    else if (walletType === 'usdt_bep20') balanceField = 'usdt_bep20_balance';
    else if (walletType === 'usdt_sol') balanceField = 'usdt_sol_balance';
    else if (walletType === 'usdt_matic') balanceField = 'usdt_matic_balance';
    else if (walletType === 'usdt_avax') balanceField = 'usdt_avax_balance';
    else if (walletType === 'usdc_bep20') balanceField = 'usdc_bep20_balance';
    else if (walletType === 'usdc_solana') balanceField = 'usdc_solana_balance';
    else if (walletType === 'usdc_matic') balanceField = 'usdc_matic_balance';
    else if (walletType === 'usdc_avax') balanceField = 'usdc_avax_balance';
    else if (walletType === 'btc') balanceField = 'btc_balance';
    else if (walletType === 'eth') balanceField = 'balance'; // ETH is 'balance'
    else if (walletType === 'bnb') balanceField = 'bnb_balance';
    else if (walletType === 'sol') balanceField = 'sol_balance';
    else if (walletType === 'trx') balanceField = 'trx_balance';
    else if (walletType === 'matic') balanceField = 'matic_balance';
    else if (walletType === 'avax') balanceField = 'avax_balance';
    else balanceField = walletType + '_balance';

    // 1. Get current user data
    const { data: user } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', selectedUser)
      .single();

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get user wallet
    let { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', selectedUser)
      .maybeSingle();
      
    if (!wallet) {
      const { data: newWallet } = await supabaseAdmin
        .from('wallets')
        .insert({ user_id: selectedUser })
        .select()
        .single();
      wallet = newWallet;
    }

    if (!wallet) {
        return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const { data: newTx } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: selectedUser,
        type: 'deposit',
        amount: numAmount,
        currency: currency,
        status: 'completed',
        created_at: date || new Date().toISOString(),
        from_address: fromAddress || null,
        tx_hash: txHash || null
      })
      .select()
      .single();

    if (balanceField) {
      const currentBalance = parseFloat(wallet[balanceField] || 0);
      const { error: updateErr } = await supabaseAdmin
        .from('wallets')
        .update({ [balanceField]: currentBalance + numAmount })
        .eq('user_id', selectedUser);
      if (updateErr) throw new Error("DB Error updating wallet: " + updateErr.message);
    }

    // Send email if requested
    if (shouldSendEmail && user.email) {
      try {
        const symbol = currency.split('_')[0];
        const displayUsername = (user.first_name || user.last_name) 
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
          : (user.email ? user.email.split('@')[0] : 'Member');
        
        const networkStr = formatNetwork(currency);
        const dateUtc = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const finalTxId = txHash ? txHash.substring(0, 10) + '...' : (newTx?.id?.substring(0, 8) || 'Internal');
          
        const emailTemplate = emailCompletedDeposit(numAmount, symbol, networkStr, finalTxId, dateUtc, displayUsername);
        await sendEmail({ to: user.email, ...emailTemplate });
      } catch (emailErr) {
        console.error("Failed to send email to " + user.email, emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
