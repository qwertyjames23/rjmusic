import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            const finalNext = user?.email === 'raffyjames65@gmail.com' ? '/admin/dashboard' : next

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${finalNext}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${finalNext}`)
            } else {
                return NextResponse.redirect(`${origin}${finalNext}`)
            }
        }
        // If there is an error, redirect with the error message
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    // return the user to an error page with instructions if no code is present
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No%20auth%20code%20provided`)
}
