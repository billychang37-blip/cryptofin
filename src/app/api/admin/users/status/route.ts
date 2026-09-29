import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { userId, status, suspendUntil } = await request.json();

    if (!userId || !status) {
      return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        status: status,
        suspend_until: suspendUntil || null
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Status Update Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
