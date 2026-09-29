import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // --- CLOUDFLARE WAF POST INTERCEPT ---
  // Cloudflare Managed Challenge often redirects visitors back to the requested page 
  // using a POST request. Vercel rejects POST requests to static frontend pages with a 405 error.
  // This intercepts those POST requests and forces a 302 redirect to the same URL as a GET request.
  if (request.method === 'POST' && !request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL(request.url), 302);
  }

  // 1. Create an initial response
  // We need this to be a "let" because supabase might modify it to set cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // 2. Refresh the Session (Wrapped in Try/Catch to prevent crashes)
  let user = null;
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error) throw error; // Throw to catch block if Supabase returns an error
    user = supabaseUser;
  } catch (e) {
    // 🛑 CRITICAL FIX: If the cookie is corrupted (Zombie Session),
    // we catch the error here instead of letting the server crash.
    // We simply treat the user as "Logged Out".
    // console.error("Middleware Auth Warning:", e); // Optional: Uncomment for debugging
    user = null;
  }

  // 3. Protect Dashboard Routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 4. Redirect Logged-In Users away from Auth Pages
  if (request.nextUrl.pathname.startsWith('/auth')) {
    const isSetupRoute = request.nextUrl.pathname.includes('/recovery-phrase') || request.nextUrl.pathname.includes('/create-pin');
    if (user && !isSetupRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (all API routes - explicitly excluded so POSTs hit the backend)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};