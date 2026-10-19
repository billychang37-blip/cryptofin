import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

export async function GET() {
  try {
    // 1. Fetch all KYC applications
    const { data: applications, error: appError } = await supabaseAdmin
      .from('kyc_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (appError) {
      console.error("KYC applications fetch error:", appError);
      return NextResponse.json({ error: appError.message }, { status: 500 });
    }

    // 2. Fetch profiles to match user details (name, email, avatar)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, first_name, last_name, full_name, email, avatar_url, country');

    if (profileError) {
      console.error("Profiles fetch error in KYC:", profileError);
    }

    // 3. Fetch wallets to get 8-digit readable_id (UID)
    const { data: wallets } = await supabaseAdmin
      .from('wallets')
      .select('user_id, readable_id');

    const profileList = profiles || [];
    const walletList = wallets || [];

    const requests = (applications || []).map(app => {
      const profile = profileList.find(p => p.id === app.user_id);
      const wallet = walletList.find(w => w.user_id === app.user_id);
      const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.full_name || profile?.email?.split('@')[0] || 'User';

      return {
        id: app.id,
        user_id: app.user_id,
        country: app.country || profile?.country || 'N/A',
        document_type: app.document_type || 'National ID card',
        document_number: app.document_number || 'N/A',
        image_url: app.image_url || '',
        status: app.status || 'pending',
        created_at: app.created_at,
        updated_at: app.updated_at,
        profiles: {
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          full_name: fullName,
          email: profile?.email || '',
          walletId: wallet?.readable_id || 'N/A',
          avatar_url: profile?.avatar_url || ''
        }
      };
    });

    return NextResponse.json({ requests });
  } catch (err: any) {
    console.error("Admin KYC GET error:", err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicationId, transactionId, userId, action } = body;
    const targetId = applicationId || transactionId;

    if (!targetId && !userId) {
      return NextResponse.json({ error: 'Missing applicationId or userId' }, { status: 400 });
    }

    if (!action || !['approve', 'reject', 'pending'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be approve, reject, or pending' }, { status: 400 });
    }

    const newKycStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending';

    // 1. Update kyc_applications table (Source of Truth)
    let query = supabaseAdmin.from('kyc_applications').update({
      status: newKycStatus,
      updated_at: new Date().toISOString()
    });

    if (targetId) {
      query = query.eq('id', targetId);
    } else {
      query = query.eq('user_id', userId);
    }

    const { error: kycUpdateError } = await query;
    if (kycUpdateError) {
      console.error("KYC update error:", kycUpdateError);
      return NextResponse.json({ error: kycUpdateError.message }, { status: 500 });
    }

    // 2. Also sync to user metadata in Auth
    if (userId) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { kyc_status: newKycStatus }
        });
      } catch (authErr) {
        console.warn("Auth user_metadata update skipped/warn:", authErr);
      }
    }

    return NextResponse.json({ success: true, status: newKycStatus });
  } catch (err: any) {
    console.error("Admin KYC POST error:", err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('kyc_applications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
