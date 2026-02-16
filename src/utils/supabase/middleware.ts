import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Simple in-memory rate limit cache (Note: this is ephemeral and per-instance)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_THRESHOLD = 60; // Max requests
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms

export async function updateSession(request: NextRequest) {
    // 0. Rate Limiting Check (Simple IP-based)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : (request as unknown as { ip?: string }).ip || '127.0.0.1';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
        rateData.count = 0;
        rateData.lastReset = now;
    }

    rateData.count++;
    rateLimitMap.set(ip, rateData);

    if (rateData.count > RATE_LIMIT_THRESHOLD && request.nextUrl.pathname.startsWith('/api')) {
        console.warn(`🚫 Rate limit exceeded for IP: ${ip}`);
        return new NextResponse('Too Many Requests', { 
            status: 429,
            headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': RATE_LIMIT_THRESHOLD.toString(),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': (rateData.lastReset + RATE_LIMIT_WINDOW).toString()
            }
        });
    }

    // Create an initial response
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Track cookies to ensure they are propagated to redirects
    type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];
    const cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[] = []

    // Redirect to main domain if on vercel sub-domain
    const host = request.headers.get('host')
    if (host && host.includes('vercel.app') && !host.includes('localhost')) {
        const url = request.nextUrl.clone()
        url.host = 'www.rjmusic.shop'
        url.protocol = 'https'
        return NextResponse.redirect(url)
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookies) {
                    cookies.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookies.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                        cookiesToSet.push({ name, value, options })
                    })
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    let user = null;
    try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
            // Handle invalid refresh token - treat as logged out but don't force signOut
            // as it can clear PKCE verifiers during callbacks.
            console.log('Auth check note:', error.message);
        } else {
            user = data.user;
        }
    } catch (error) {
        console.log('Auth error caught:', error);
    }

    console.log('🔍 Middleware Check:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
        userEmail: user?.email || 'none'
    });

    // Helper to apply tracked cookies to a response
    const applyCookies = (response: NextResponse) => {
        cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
        })
    }

    // 0. Protect Checkout and Cart
    if (!user && (request.nextUrl.pathname.startsWith('/checkout') || request.nextUrl.pathname === '/cart')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)

        const response = NextResponse.redirect(url)
        applyCookies(response)
        return response
    }

    // 1. If NO USER -> Redirect to Login (for Admin)
    if (!user && request.nextUrl.pathname.startsWith('/admin')) {
        console.log('🚫 No user session - Redirecting to login from:', request.nextUrl.pathname)
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)

        const response = NextResponse.redirect(url)
        applyCookies(response)
        return response
    }

    // 2. If USER EXISTS but tries to access ADMIN -> Check DB Role
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        // Fetch role from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            console.error('❌ Error fetching user profile or profile not found:', profileError);
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        const isAdmin = profile.role === 'admin';

        console.log('🔐 Admin Access Check (DB Role):', {
            userId: user.id,
            email: user.email,
            role: profile.role,
            isAdmin: isAdmin,
            path: request.nextUrl.pathname
        })

        // If not admin, redirect to home
        if (!isAdmin) {
            console.log('❌ Access Denied: User is not admin')
            const url = request.nextUrl.clone()
            url.pathname = '/'

            const response = NextResponse.redirect(url)
            applyCookies(response)
            return response
        }

        console.log('✅ Access Granted: User is admin')
    }

    // 3. If logged in user tries to access Login, redirect appropriately
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        // We might also want to check the role here for proper redirect
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.role === 'admin';

        const url = request.nextUrl.clone()
        if (isAdmin) {
            url.pathname = '/admin/dashboard'
        } else {
            url.pathname = '/'
        }

        const response = NextResponse.redirect(url)
        applyCookies(response)
        return response
    }

    return supabaseResponse
}
