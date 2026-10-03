import { NextResponse } from 'next/server';
import { sendEmail, emailPendingWithdrawal } from '@/lib/emails';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { amount, assetId, toAddress, userId, userEmail, userName } = await request.json();
    
    // We can fetch the user profile if missing
    let targetEmail = userEmail;
    let targetName = userName;
    
    if (!targetEmail) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { get: (n) => cookieStore.get(n)?.value } }
        );
        
        let targetId = userId;
        if (!targetId) {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) targetId = user.id;
        }
        
        if (targetId) {
             const { data: profile } = await supabase.from('profiles').select('email, first_name, last_name').eq('id', targetId).single();
             if (profile) {
                 targetEmail = profile.email;
                 targetName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || targetEmail.split('@')[0];
             }
        }
    }
    
    if (targetEmail) {
        const emailTemplate = emailPendingWithdrawal(amount, assetId, toAddress, targetName || 'User');
        await sendEmail({ to: targetEmail, ...emailTemplate });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("EMAIL SEND ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
