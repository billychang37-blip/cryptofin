import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmail, emailPendingDeposit, emailPendingWithdrawal } from '@/lib/emails';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    let userName = 'User';
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
        if (profile) userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    }
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, assetId, amount, toAddress } = await request.json();
    if (!type || !assetId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    let colName = '';
    if (assetId === 'USDT' || assetId === 'usdt_erc20') colName = 'usdt_erc20_balance';
    else if (assetId === 'USDT_TRX' || assetId === 'usdt_trc20') colName = 'usdt_trc20_balance';
    else if (assetId === 'USDT_BNB' || assetId === 'usdt_bep20') colName = 'usdt_bep20_balance';
    else if (assetId === 'USDT_SOL' || assetId === 'usdt_sol') colName = 'usdt_sol_balance';
    else if (assetId === 'USDT_MATIC' || assetId === 'usdt_matic') colName = 'usdt_matic_balance';
    else if (assetId === 'USDT_AVAX' || assetId === 'usdt_avax') colName = 'usdt_avax_balance';
    else if (assetId === 'USDC_BNB' || assetId === 'usdc_bep20') colName = 'usdc_bep20_balance';
    else if (assetId === 'USDC_SOL' || assetId === 'usdc_solana') colName = 'usdc_solana_balance';
    else if (assetId === 'USDC' || assetId === 'usdc_erc20') colName = 'usdc_balance';
    else if (assetId === 'BTC' || assetId === 'btc') colName = 'btc_balance';
    else if (assetId === 'ETH' || assetId === 'eth') colName = 'balance';
    else if (assetId === 'BNB' || assetId === 'bnb') colName = 'bnb_balance';
    else if (assetId === 'SOL' || assetId === 'sol') colName = 'sol_balance';
    else if (assetId === 'TRX' || assetId === 'trx') colName = 'trx_balance';
    else if (assetId === 'MATIC' || assetId === 'matic') colName = 'matic_balance';
    else if (assetId === 'AVAX' || assetId === 'avax') colName = 'avax_balance';
    else colName = assetId.split('_')[0].toLowerCase() + '_balance';
    if (!colName) {
        return NextResponse.json({ error: 'Unsupported asset' }, { status: 400 });
    }

    if (type === 'withdrawal') {
        if (!toAddress) return NextResponse.json({ error: 'Destination address required' }, { status: 400 });
        
        // 1. Check balance
        const { data: wallet, error: walletErr } = await supabase
            .from('wallets')
            .select(colName)
            .eq('user_id', user.id)
            .single();
            
        if (walletErr || !wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        
        const currentBalance = Number(wallet[colName as keyof typeof wallet] || 0);
        if (currentBalance < numAmount) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }
        
        // 2. Deduct balance
        const { error: updateErr } = await supabase
            .from('wallets')
            .update({ [colName]: currentBalance - numAmount })
            .eq('user_id', user.id);
            
        if (updateErr) throw updateErr;

        // 3. Log transaction
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'withdrawal',
            amount: numAmount,
            currency: assetId, // Keep full assetId for history (e.g. USDT_TRX)
            status: 'pending',
            to_address: toAddress
        });
        
        // Send email
        if (user.email) {
            const emailTemplate = emailPendingWithdrawal(numAmount, assetId, toAddress, userName);
            await sendEmail({ to: user.email, ...emailTemplate });
        }
        
        return NextResponse.json({ success: true, message: 'Withdrawal pending approval' });
        
    } else if (type === 'deposit') {
        // 1. Log transaction (no balance change yet)
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'deposit',
            amount: numAmount,
            currency: assetId,
            status: 'pending',
            to_address: toAddress || 'Internal Wallet'
        });
        
        // Send email
        if (user.email) {
            const emailTemplate = emailPendingDeposit(numAmount, assetId, toAddress || 'Internal Wallet', userName);
            await sendEmail({ to: user.email, ...emailTemplate });
        }
        
        return NextResponse.json({ success: true, message: 'Deposit pending verification' });
    }

    return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });

  } catch (err: any) {
    console.error("TX CREATE ERROR:", err);
    return NextResponse.json({ error: err.message || 'Transaction failed' }, { status: 500 });
  }
}
