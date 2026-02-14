import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // Create an initial response
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Track cookies to ensure they are propagated to redirects
    type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];
    const cookiesToSet: { name: string; value: string; options?: CookieSetOptions }[] = []

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
            // Handle invalid refresh token - clear cookies and treat as logged out
            console.log('Auth error (possibly invalid refresh token):', error.message);
            // Explicitly sign out to clear invalid sessions, which triggers setAll with delete instructions
            await supabase.auth.signOut();
        } else {
            user = data.user;
        }
    } catch (error) {
        console.log('Auth error caught:', error);
        await supabase.auth.signOut();
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

    // 2. If USER EXISTS but tries to access ADMIN -> Check Email
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        const adminEmail = process.env.ADMIN_EMAIL;

        // If no admin email configured, block everyone by default for security
        if (!adminEmail) {
            console.error('❌ ADMIN_EMAIL not set in environment variables. blocking access.');
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        const isAdmin = user.email === adminEmail;

        console.log('🔐 Admin Access Check:', {
            userId: user.id,
            email: user.email,
            adminEmail: adminEmail,
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
        const adminEmail = process.env.ADMIN_EMAIL;
        const isAdmin = user.email === adminEmail;

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
