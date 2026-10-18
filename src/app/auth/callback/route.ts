import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');
  
  // Redirect to /dashboard after login, unless specified otherwise
  const next = searchParams.get('next') ?? '/dashboard';

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${error}&desc=${error_description}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignored
            }
          },
        },
      }
    );
    
    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's no code but no explicit error, it might be an Implicit Flow (hash fragment).
  // The server cannot read hash fragments, but if we redirect to the destination,
  // the browser will preserve the hash, allowing the client-side Supabase client to parse it.
  return NextResponse.redirect(`${origin}${next}`);
}