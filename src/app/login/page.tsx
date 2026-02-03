"use client";

import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chrome, Mail, Lock, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

function LoginForm() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback?next=${next}`,
            },
        });

        if (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-400">
                        {isSignUp ? 'Sign up to start shopping' : 'Sign in to your account'}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-[#0f141a] rounded-2xl border border-white/10 p-8 shadow-2xl">
                    {/* Error/Success Messages */}
                    {searchParams.get('error') && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 animate-in slide-in-from-top-2">
                            {searchParams.get('error')}
                        </div>
                    )}

                    {searchParams.get('message') && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm mb-6 animate-in slide-in-from-top-2">
                            {searchParams.get('message')}
                        </div>
                    )}

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3.5 rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl mb-6"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Chrome className="size-5" />
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f141a] px-3 text-gray-500 font-medium">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form className="space-y-4">
                        <input type="hidden" name="next" value={next} />

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="space-y-3 pt-2">
                            <button
                                formAction={isSignUp ? signup : login}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
                            >
                                {isSignUp ? 'Create Account' : 'Sign In'}
                                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </form>

                    {/* Toggle Sign Up/Login */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isSignUp ? (
                                <>
                                    Already have an account?{' '}
                                    <span className="text-primary font-semibold">Sign In</span>
                                </>
                            ) : (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <span className="text-primary font-semibold">Sign Up</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
