import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('id, user_id, status, description, created_at, type')
      .eq('type', 'kyc_request')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch profiles from the database instead of auth.users to ensure we get names
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, email');

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const txsWithProfiles = data.map(tx => {
      const profile = profiles.find(p => p.id === tx.user_id);
      return {
        ...tx,
        profiles: {
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: profile?.email || ''
        }
      };
    });

    return NextResponse.json({ requests: txsWithProfiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { transactionId, userId, action } = await request.json(); 
    
    if (!transactionId || !userId || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const newKycStatus = action === 'approve' ? 'approved' : 'unverified';
    const newTxStatus = action === 'approve' ? 'completed' : 'failed';

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { kyc_status: newKycStatus }
    });

    // ALSO update the profiles table so everything stays perfectly in sync!
    await supabaseAdmin.from('profiles').update({ kyc_status: newKycStatus }).eq('id', userId);

    if (authError) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    const { error: txError } = await supabaseAdmin
      .from('transactions')
      .update({ status: newTxStatus })
      .eq('id', transactionId);

    if (txError) {
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
