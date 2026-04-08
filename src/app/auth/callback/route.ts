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

            // Force redirect to the correct production domain if on Vercel
            const host = request.headers.get('host')
            if (host && host.includes('vercel.app')) {
                return NextResponse.redirect(`https://www.rjmusic.shop${finalNext}`)
            }

            return NextResponse.redirect(`${origin}${finalNext}`)
        }
        
        console.error('Auth callback error:', error.message)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    // return the user to an error page with instructions if no code is present
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=No%20auth%20code%20provided`)
}
