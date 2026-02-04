import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
            auth: {
                flowType: 'pkce',
                detectSessionInUrl: true,
                persistSession: true,
            }
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    console.log('🔍 Middleware Check:', {
        path: request.nextUrl.pathname,
        hasUser: !!user,
        userEmail: user?.email || 'none'
    });

    // 0. Protect Checkout and Cart
    if (!user && (request.nextUrl.pathname.startsWith('/checkout') || request.nextUrl.pathname === '/cart')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // 1. If NO USER -> Redirect to Login
    if (!user && request.nextUrl.pathname.startsWith('/admin')) {
        console.log('🚫 No user session - Redirecting to login from:', request.nextUrl.pathname)
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // 2. If USER EXISTS but tries to access ADMIN -> Check Role
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        // Fetch user profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        console.log('🔐 Admin Access Check:', {
            userId: user.id,
            email: user.email,
            role: profile?.role,
            path: request.nextUrl.pathname
        })

        // If not admin role, redirect to home
        if (!profile || profile.role !== 'admin') {
            console.log('❌ Access Denied: User is not admin')
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        console.log('✅ Access Granted: User is admin')
    }

    // 3. Optional: If logged in user tries to access Login, redirect appropriately
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const url = request.nextUrl.clone()
        if (profile?.role === 'admin') {
            url.pathname = '/admin/dashboard'
        } else {
            url.pathname = '/'
        }
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
