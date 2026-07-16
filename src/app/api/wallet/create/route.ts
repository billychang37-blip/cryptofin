// src/app/api/wallet/create/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: any) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pin } = await request.json();
    if (!pin || pin.length !== 4) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    console.log(`[Production Setup] Generating HD Wallet for ${user.id}`);

    // 2. SET PIN (Security Layer)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    const { error: secError } = await supabase.from('user_security').upsert({
      id: user.id,
      pin_hash: hash,
      is_pin_set: true,
      updated_at: new Date().toISOString()
    });

    if (secError) {
        console.error("Security Save Error:", secError);
        return NextResponse.json({ error: "Security DB Error: " + secError.message }, { status: 500 });
    }

    // 3. CHECK EXISTING WALLET
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingWallet) {
      // ✅ ENTERPRISE HD WALLET GENERATION 
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

      // Derive the public address strictly using the index (Ethers v6 syntax)
      const childWallet = ethers.HDNodeWallet.fromPhrase(masterSeed, "", `m/44'/60'/0'/0/${nextIndex}`);
      const derivedAddress = childWallet.address;
      
      // ✅ DATABASE INSERTION (Zero Private Key Storage)
      const { error: walletError } = await supabase.from('wallets').insert({
        user_id: user.id,
        readable_id: 'CORE-' + user.id.slice(0, 6).toUpperCase(),
        address: derivedAddress,   
        private_key: null, 
        encrypted_private_key: null, // Bypassing local encryption entirely for HD
        wallet_type: 'hd',           // New Schema Column
        hd_index: nextIndex,         // New Schema Column
        is_primary: true,
        balance: 0,
        email: user.email
      });

      if (walletError) {
          console.error("Wallet Insert Error:", walletError);
          // Rollback: Delete the PIN so we don't get stuck in "Half-Created" mode
          await supabase.from('user_security').delete().eq('id', user.id);
          return NextResponse.json({ error: "Wallet DB Error: " + walletError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'HD Wallet Generated' });

  } catch (err: any) {
    console.error("Setup Crash:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}