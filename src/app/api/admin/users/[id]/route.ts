import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || ''),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || '')
);

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // 1. Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      throw profileError;
    }

    // 2. Fetch wallet
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();

    // 3. Fetch KYC status from kyc_applications
    const { data: kyc } = await supabaseAdmin
      .from('kyc_applications')
      .select('status')
      .eq('user_id', id)
      .maybeSingle();

    const mappedWallet = wallet ? {
      ...wallet,
      eth_balance: wallet.balance,
      usdt_erc20_address: wallet.address,
      usdt_bep20_address: wallet.address,
      usdc_bep20_address: wallet.address,
      usdt_trc20_address: wallet.trx_address,
      usdc_solana_address: wallet.sol_address,
    } : {};

    const mergedProfile = { 
      ...profile, 
      ...mappedWallet,
      kyc_status: kyc?.status || 'unverified'
    };

    // 4. Fetch transactions
    const { data: txData, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (txError) {
      console.warn("Transactions fetch error:", txError.message);
    }

    return NextResponse.json({ profile: mergedProfile, transactions: txData || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    // Extract profile fields (excluding kyc_status since it lives in kyc_applications)
    const profileFields: Record<string, any> = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      country: body.country,
      address: body.address,
      dob: body.dob,
      status: body.status,
      account_type: body.account_type
    };

    const walletFields: Record<string, any> = {
      usdt_erc20_balance: body.usdt_erc20_balance,
      usdt_trc20_balance: body.usdt_trc20_balance,
      usdt_bep20_balance: body.usdt_bep20_balance,
      usdc_bep20_balance: body.usdc_bep20_balance,
      usdc_solana_balance: body.usdc_solana_balance,
      usdt_balance: body.usdt_balance,
      usdc_balance: body.usdc_balance,
      btc_balance: body.btc_balance,
      balance: body.eth_balance,
      sol_balance: body.sol_balance,
      trx_balance: body.trx_balance,
      bnb_balance: body.bnb_balance,
      matic_balance: body.matic_balance,
      avax_balance: body.avax_balance,
      
      address: body.address ?? body.usdt_erc20_address ?? body.usdt_bep20_address ?? body.usdc_bep20_address,
      trx_address: body.trx_address ?? body.usdt_trc20_address,
      sol_address: body.sol_address ?? body.usdc_solana_address,
      btc_address: body.btc_address,
      
      gas_override: body.gas_override,
      currency: body.currency,
      account_number: body.account_number,
      soft_token: body.soft_token,
      generated_user_id: body.generated_user_id,
      generated_pin: body.generated_pin
    };

    // Remove undefined values
    Object.keys(profileFields).forEach(key => {
      if (profileFields[key] === undefined) delete profileFields[key];
    });
    Object.keys(walletFields).forEach(key => {
      if (walletFields[key] === undefined) delete walletFields[key];
    });

    if (Object.keys(profileFields).length > 0) {
      const { error: pError } = await supabaseAdmin.from('profiles').update(profileFields).eq('id', id);
      if (pError) throw pError;
    }

    if (Object.keys(walletFields).length > 0) {
      const { error: wError } = await supabaseAdmin.from('wallets').update(walletFields).eq('user_id', id);
      if (wError) throw wError;
    }

    // Sync KYC status if provided
    if (body.kyc_status !== undefined) {
      const { error: kycError } = await supabaseAdmin
        .from('kyc_applications')
        .upsert({
          user_id: id,
          status: body.kyc_status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (kycError) {
        console.warn("KYC sync error in PUT user:", kycError.message);
      }

      try {
        await supabaseAdmin.auth.admin.updateUserById(id, {
          user_metadata: { kyc_status: body.kyc_status }
        });
      } catch (authErr) {
        console.warn("Auth user_metadata update skipped:", authErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
