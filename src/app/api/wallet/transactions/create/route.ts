
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { sendEmail, emailPendingDeposit, emailPendingWithdrawal } from '@/lib/emails';

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

const shortAddr = (addr: string) => addr ? (addr.length > 15 ? addr.slice(0,6) + '...' + addr.slice(-4) : addr) : 'Internal';

export async function POST(request: Request) {
  try {
    const { amount, assetId, type, toAddress, description, network } = await request.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const txType = type || 'withdrawal';
    const txStatus = txType === 'deposit' ? 'processing' : 'processing';

    const { data, error } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: txType,
        amount: numAmount,
        currency: assetId,
        status: txStatus,
        to_address: toAddress || null,
        description: description || null,
        metadata: {
            network: network || formatNetwork(assetId)
        }
    }).select().single();

    if (error) {
        throw error;
    }
    
    // User profile for name
    const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
    const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : (user.email ? user.email.split('@')[0] : 'User');
    const dateUtc = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const assetSymbol = assetId.split('_')[0];
    const netStr = network || formatNetwork(assetId);

    if (txType === 'withdrawal') {
        if (user.email) {
            const destAddr = shortAddr(toAddress);
            const emailTemplate = emailPendingWithdrawal(numAmount, assetSymbol, destAddr, netStr, dateUtc, userName);
            await sendEmail({ to: user.email, ...emailTemplate });
        }
    } else {
        if (user.email) {
            const emailTemplate = emailPendingDeposit(numAmount, assetSymbol, toAddress || 'Internal Wallet', userName);
            await sendEmail({ to: user.email, ...emailTemplate });
        }
    }

    return NextResponse.json({ success: true, transaction: data });
  } catch (err: any) {
    console.error("TX CREATE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
