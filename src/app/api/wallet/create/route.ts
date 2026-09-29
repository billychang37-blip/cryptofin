// src/app/api/wallet/create/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Import multi-chain libraries
import { TronWeb } from 'tronweb';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

const bip32 = BIP32Factory(ecc);

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

    console.log(`[Production Setup] Generating Multi-Chain HD Wallets for ${user.id}`);

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
      // 🚨 ENTERPRISE HD WALLET GENERATION 🚨
      const masterSeedMnemonic = process.env.CRYPTOFIN_MASTER_SEED;
      if (!masterSeedMnemonic) {
          throw new Error("CRITICAL: CRYPTOFIN_MASTER_SEED environment variable is missing.");
      }

      // Fetch the next guaranteed unique index from Postgres
      const { data: nextIndex, error: rpcError } = await supabase.rpc('get_next_hd_index');
      
      if (rpcError || nextIndex === null) {
          console.error("Sequence Fetch Error:", rpcError);
          throw new Error("Failed to retrieve next HD index.");
      }

      // --- 4. DERIVE WALLETS ---
      const masterSeedBuffer = await bip39.mnemonicToSeed(masterSeedMnemonic);

      // A. EVM (Ethereum, BSC, Polygon)
      const evmNode = ethers.HDNodeWallet.fromPhrase(masterSeedMnemonic, "", `m/44'/60'/0'/0/${nextIndex}`);
      const evmAddress = evmNode.address;
      const evmPrivateKey = evmNode.privateKey;

      // B. Tron (TRX)
      const tronNode = ethers.HDNodeWallet.fromPhrase(masterSeedMnemonic, "", `m/44'/195'/0'/0/${nextIndex}`);
      const trxPrivateKeyRaw = tronNode.privateKey.replace('0x', '');
      const tronWeb = new TronWeb({ fullHost: 'https://api.trongrid.io' });
      const trxAddress = tronWeb.address.fromPrivateKey(trxPrivateKeyRaw);
      const trxPrivateKey = trxPrivateKeyRaw;

      // C. Solana (SOL)
      const solDerivationPath = `m/44'/501'/${nextIndex}'/0'`;
      const solDerivedSeed = derivePath(solDerivationPath, masterSeedBuffer.toString('hex')).key;
      const solKeypair = Keypair.fromSeed(solDerivedSeed);
      const solAddress = solKeypair.publicKey.toBase58();
      const solPrivateKey = Buffer.from(solKeypair.secretKey).toString('hex');

      // D. Bitcoin (BTC) - Native SegWit (BIP84)
      const btcRoot = bip32.fromSeed(masterSeedBuffer);
      const btcNode = btcRoot.derivePath(`m/84'/0'/0'/0/${nextIndex}`);
      const btcPrivateKey = btcNode.toWIF();
      const btcAddress = bitcoin.payments.p2wpkh({ pubkey: btcNode.publicKey }).address;

      // --- 5. ENCRYPT ALL PRIVATE KEYS ---
      const encryptionKey = crypto.createHash('sha256').update(masterSeedMnemonic).digest();
      const encryptPk = (pk: string) => {
          const iv = crypto.randomBytes(16);
          const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
          let encrypted = cipher.update(pk, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          return iv.toString('hex') + ':' + encrypted;
      };

      const encryptedEvmPk = encryptPk(evmPrivateKey);
      const encryptedTrxPk = encryptPk(trxPrivateKey);
      const encryptedSolPk = encryptPk(solPrivateKey);
      const encryptedBtcPk = encryptPk(btcPrivateKey);

      // --- 6. DATABASE INSERTION ---
      const { error: walletError } = await supabase.from('wallets').insert({
        user_id: user.id,
        readable_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
        
        // Core EVM Wallet
        address: evmAddress,   
        private_key: evmPrivateKey, 
        encrypted_private_key: encryptedEvmPk, 
        
        // Tron Wallet
        trx_address: trxAddress,
        trx_private_key: trxPrivateKey,
        trx_encrypted_private_key: encryptedTrxPk,

        // Solana Wallet
        sol_address: solAddress,
        sol_private_key: solPrivateKey,
        sol_encrypted_private_key: encryptedSolPk,

        // Bitcoin Wallet
        btc_address: btcAddress,
        btc_private_key: btcPrivateKey,
        btc_encrypted_private_key: encryptedBtcPk,

        // Metadata
        wallet_type: 'hd',
        hd_index: nextIndex,
        is_primary: true,
        
        // Initial Balances
        balance: 0.00,
        btc_balance: 0.00,
        usdt_balance: 0.00,
        sol_balance: 0.00,
        trx_balance: 0.00,
        bnb_balance: 0.00,
        matic_balance: 0.00,
        avax_balance: 0.00,
        usdc_balance: 0.00,
        last_chain_balance: 0,
        last_known_chain_balance: 0,
        last_usdt_chain_balance: 0,
        gas_override: null
      });

      if (walletError) {
          console.error("Wallet Insert Error:", walletError);
          return NextResponse.json({ error: "Failed to allocate wallet" }, { status: 500 });
      }

      console.log(`[Success] Multi-Chain Wallets Generated for User: ${user.id}`);
    }

    return NextResponse.json({ success: true, message: "Security setup complete" });
    
  } catch (error: any) {
    console.error("Wallet Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
