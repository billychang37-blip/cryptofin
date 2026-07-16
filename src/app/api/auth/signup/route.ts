import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers'; 
import crypto from 'crypto'; // ✅ Needed for the ID generation

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // 1. Initialize Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
       if (authError.message.includes("already registered")) {
         return NextResponse.json({ error: "User already exists. Please log in." }, { status: 400 });
       }
       throw authError;
    }

    if (!authData.user) throw new Error("User creation failed");
    const userId = authData.user.id;

    // 3. GENERATE HD WALLET & ID
    const masterSeed = process.env.CORECOIN_MASTER_SEED;
    if (!masterSeed) {
        throw new Error("CRITICAL: CORECOIN_MASTER_SEED environment variable is missing.");
    }

    // Fetch the next guaranteed unique index from Postgres
    const { data: nextIndex, error: rpcError } = await supabaseAdmin.rpc('get_next_hd_index');
    if (rpcError || nextIndex === null) {
        console.error("Sequence Fetch Error:", rpcError);
        throw new Error("Failed to retrieve next HD index.");
    }

    // Derive the public address using Ethers v6 syntax
    const childWallet = ethers.HDNodeWallet.fromPhrase(masterSeed, "", `m/44'/60'/0'/0/${nextIndex}`);
    const address = childWallet.address;
    
    // ✅ Generate ID in 'CORE-XXXXXX' format
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); 
    const readableId = `CORE-${randomHex}`;

    // 4. Insert into Wallets (HD Architecture)
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: userId,
        address: address,                
        readable_id: readableId,         
        email: email,                    
        private_key: null,                   // ✅ No private key stored on server 
        encrypted_private_key: null,         // ✅ No private key stored on server
        wallet_type: 'hd',                   // ✅ Explicitly flag as HD
        hd_index: nextIndex,                 // ✅ Bind to the Postgres sequence
        currency: 'ETH',                 
        network: 'mainnet',              
        is_primary: true,                
        balance: 0.00,
        btc_balance: 0.00,
        usdt_balance: 0.00,
        sol_balance: 0.00,
        trx_balance: 0.00
      });

    // 5. Create Profile
    await supabaseAdmin.from('profiles').insert({
        user_id: userId,
        email: email,
        full_name: fullName
    });

    if (walletError) {
       console.error("Wallet DB Insert Error:", walletError);
    }

    return NextResponse.json({ success: true, userId });

  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}