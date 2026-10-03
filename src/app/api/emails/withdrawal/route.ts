import { NextResponse } from 'next/server';
import { sendEmail, emailPendingWithdrawal } from '@/lib/emails';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { amount, assetId, toAddress, userId, userEmail, userName } = await request.json();
    
    if (userEmail) {
        const emailTemplate = emailPendingWithdrawal(amount, assetId, toAddress, userName || 'User');
        await sendEmail({ to: userEmail, ...emailTemplate });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("EMAIL SEND ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
