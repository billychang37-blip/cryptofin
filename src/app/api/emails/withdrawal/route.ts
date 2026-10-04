
import { NextResponse } from 'next/server';
import { sendEmail, emailPendingWithdrawal } from '@/lib/emails';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    const { amount, assetId, toAddress, userId, userEmail, userName } = await request.json();
    
    let targetEmail = userEmail;
    let targetName = userName;
    
    if (!targetEmail) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { get: (n) => cookieStore.get(n)?.value } }
        );
        
        let targetId = userId;
        if (!targetId) {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) targetId = user.id;
        }
        
        if (targetId) {
             const { data: profile } = await supabase.from('profiles').select('email, first_name, last_name').eq('id', targetId).single();
             if (profile) {
                 targetEmail = profile.email;
                 targetName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || targetEmail.split('@')[0];
             }
        }
    }
    
    if (targetEmail) {
        const network = formatNetwork(assetId);
        const dateUtc = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const assetSymbol = assetId.split('_')[0];
        const destAddr = shortAddr(toAddress);
        const emailTemplate = emailPendingWithdrawal(amount, assetSymbol, destAddr, network, dateUtc, targetName || 'User');
        await sendEmail({ to: targetEmail, ...emailTemplate });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("EMAIL SEND ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
