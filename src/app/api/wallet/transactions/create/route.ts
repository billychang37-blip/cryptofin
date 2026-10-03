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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, assetId, amount, toAddress } = await request.json();
    if (!type || !assetId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const baseAsset = assetId.split('_')[0];
    const colMap: Record<string, string> = {
        'BTC': 'btc_balance', 'ETH': 'balance', 'USDT': 'usdt_balance',
        'SOL': 'sol_balance', 'TRX': 'trx_balance', 'BNB': 'bnb_balance',
        'MATIC': 'matic_balance', 'AVAX': 'avax_balance', 'USDC': 'usdc_balance'
    };
    const colName = colMap[baseAsset];
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
            const emailTemplate = emailPendingWithdrawal(numAmount, assetId, toAddress);
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
            const emailTemplate = emailPendingDeposit(numAmount, assetId, toAddress || 'Internal Wallet');
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
