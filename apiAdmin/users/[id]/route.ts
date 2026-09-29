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
    console.log("Fetching profile for ID:", id);
    
    // Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError.message);
      throw profileError;
    }

    // Fetch transactions
    const { data: txData, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    // Don't throw txError, just ignore if the table doesn't exist
    if (txError) {
      console.warn("Transactions fetch error:", txError.message);
    }

    return NextResponse.json({ profile, transactions: txData || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(body)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
