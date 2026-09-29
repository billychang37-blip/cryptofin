import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers'; 
import crypto from 'crypto'; // ✅ Needed for the ID generation

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone } = await request.json();

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

        // 2. Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: "This email is already linked to an account." }, { status: 400 });
    }

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone: phone },
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

    // 3. Create Profile
    await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: email,
        full_name: fullName
    });



    return NextResponse.json({ success: true, userId });

  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
