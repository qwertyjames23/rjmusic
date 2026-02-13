
import Link from 'next/link'

export default async function AuthErrorPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0f141a] rounded-2xl border border-white/10 p-8 shadow-2xl text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Authentication Error</h1>
                <p className="text-gray-400 mb-8 break-words">
                    {error || 'An error occurred during authentication.'}
                </p>
                <Link
                    href="/login"
                    className="inline-block w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-primary/30"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    )
}
