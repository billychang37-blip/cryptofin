import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// ❌ Removed CryptoJS and ENCRYPTION_KEY completely - no longer storing private keys!

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

    // 1. GENERATE HD WALLET (The "Reset" State)
    const masterSeed = process.env.CORECOIN_MASTER_SEED;
    if (!masterSeed) {
        throw new Error("CRITICAL: CORECOIN_MASTER_SEED environment variable is missing.");
    }

    // Fetch the next guaranteed unique index from Postgres
    const { data: nextIndex, error: rpcError } = await supabase.rpc('get_next_hd_index');
    if (rpcError || nextIndex === null) {
        console.error("Sequence Fetch Error:", rpcError);
        throw new Error("Failed to retrieve next HD index.");
    }

    // Derive the new public address using Ethers v6 syntax
    const childWallet = ethers.HDNodeWallet.fromPhrase(masterSeed, "", `m/44'/60'/0'/0/${nextIndex}`);
    const newAddress = childWallet.address;

    // 2. Overwrite the existing wallet with this new HD assignment
    const { error } = await supabase
      .from('wallets')
      .update({
        address: newAddress,
        private_key: null,                   // ✅ Wipe any legacy private key
        encrypted_private_key: null,         // ✅ Wipe any legacy encrypted key
        wallet_type: 'hd',                   // ✅ Upgrade row to HD
        hd_index: nextIndex,                 // ✅ Assign the new sequence number
        balance: 0,
        usdt_balance: 0,
        currency: 'ETH'
      })
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, newAddress: newAddress });

  } catch (err: any) {
    console.error("Disconnect API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}