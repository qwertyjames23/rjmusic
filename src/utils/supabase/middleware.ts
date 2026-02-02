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
                    cookiesToSet.forEach(({ name, value, options }) =>
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
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 0. Protect Checkout
    if (!user && request.nextUrl.pathname.startsWith('/checkout')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // 1. If NO USER -> Redirect to Login
    if (!user && request.nextUrl.pathname.startsWith('/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 2. If USER EXISTS but tries to access ADMIN -> Check Email
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        if (user.email !== 'raffyjames65@gmail.com') {
            // Redirect unauthorized users to home or user dashboard
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // 3. Optional: If Admin tries to access Login, redirect to Dashboard
    if (user && request.nextUrl.pathname.startsWith('/login')) {
        if (user.email === 'raffyjames65@gmail.com') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/dashboard'
            return NextResponse.redirect(url)
        } else {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
