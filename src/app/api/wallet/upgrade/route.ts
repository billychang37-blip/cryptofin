import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { TronWeb } from 'tronweb';
import { Keypair } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import { ECPairFactory } from 'ecpair';

const ECPair = ECPairFactory(ecc);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    // 1. Fetch wallet
    const { data: wallet, error: fetchErr } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchErr || !wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    // 2. Check if already upgraded
    if (wallet.trx_address && wallet.sol_address && wallet.btc_address) {
        return NextResponse.json({ success: true, message: 'Already upgraded' });
    }

    // 3. We need their raw private key to derive the others deterministically
    let evmPrivateKey = wallet.private_key;
    if (!evmPrivateKey) return NextResponse.json({ error: 'No base private key found' }, { status: 400 });

    const masterSeedMnemonic = process.env.CRYPTOFIN_MASTER_SEED;
    if (!masterSeedMnemonic) throw new Error("Missing CRYPTOFIN_MASTER_SEED");
    const encryptionKey = crypto.createHash('sha256').update(masterSeedMnemonic).digest();

    if (evmPrivateKey.includes(':')) {
       const [ivHex, encryptedHex] = evmPrivateKey.split(':');
       
       try {
          const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(ivHex, 'hex'));
          let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          evmPrivateKey = decrypted;
       } catch (err) {
          // Fallback to legacy ENCRYPTION_KEY
          const legacyKeyStr = process.env.ENCRYPTION_KEY;
          if (!legacyKeyStr) throw err;
          // if legacyKeyStr is 32 chars, use it as utf-8 buffer, else if it's hex, use as hex buffer. 
          // Previous wallet implementation used Buffer.from(legacyKeyStr) which takes it as utf8 by default if it's 32 chars.
          const legacyKey = legacyKeyStr.length === 32 ? Buffer.from(legacyKeyStr) : crypto.createHash('sha256').update(legacyKeyStr).digest();
          
          const decipher2 = crypto.createDecipheriv('aes-256-cbc', legacyKey, Buffer.from(ivHex, 'hex'));
          let decrypted2 = decipher2.update(encryptedHex, 'hex', 'utf8');
          decrypted2 += decipher2.final('utf8');
          evmPrivateKey = decrypted2;
       }
    }

    const rawHex = evmPrivateKey.replace('0x', '');

    // A. Tron Derivation
    const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
    const trxAddress = tronWeb.address.fromPrivateKey(rawHex);
    const trxPrivateKey = rawHex;

    // B. Bitcoin Derivation
    const keyPair = ECPair.fromPrivateKey(Buffer.from(rawHex, 'hex'));
    const btcAddress = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey }).address;
    const btcPrivateKey = keyPair.toWIF();

    // C. Solana Derivation (Hash the secp256k1 key to generate an ed25519 seed)
    const solSeed = crypto.createHash('sha256').update(Buffer.from(rawHex, 'hex')).digest();
    const solKeypair = Keypair.fromSeed(solSeed);
    const solAddress = solKeypair.publicKey.toBase58();
    const solPrivateKey = Buffer.from(solKeypair.secretKey).toString('hex');

    // D. Encrypt all newly generated keys using the master seed
    const encryptPk = (pk: string) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
        let encrypted = cipher.update(pk, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    };

    const trxEncrypted = encryptPk(trxPrivateKey);
    const solEncrypted = encryptPk(solPrivateKey);
    const btcEncrypted = encryptPk(btcPrivateKey);

    // 4. Update the database seamlessly
    const { error: updateErr } = await supabaseAdmin
      .from('wallets')
      .update({
         trx_address: trxAddress,
         trx_private_key: trxPrivateKey,
         trx_encrypted_private_key: trxEncrypted,
         sol_address: solAddress,
         sol_private_key: solPrivateKey,
         sol_encrypted_private_key: solEncrypted,
         btc_address: btcAddress,
         btc_private_key: btcPrivateKey,
         btc_encrypted_private_key: btcEncrypted
      })
      .eq('user_id', selectedUser);

    if (updateErr) throw updateErr;

    console.log(`[Upgraded] User ${userId} successfully upgraded to Multi-Chain.`);
    return NextResponse.json({ success: true, message: 'Upgraded successfully' });

  } catch (error: any) {
    console.error("Upgrade Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
