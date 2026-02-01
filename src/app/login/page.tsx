"use client";

import { login, signup } from './actions'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#09090b] text-white">

            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-[400px] flex flex-col gap-6">
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                        <p className="text-gray-400">Enter your credentials to access your account</p>
                    </div>

                    <form className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="bg-[#18181b] border border-[#27272a] rounded-md p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-[#18181b] border border-[#27272a] rounded-md p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            formAction={login}
                            className="bg-white text-black font-semibold py-3 rounded-md hover:bg-gray-200 transition-colors mt-2"
                        >
                            Sign In with Email
                        </button>

                        <button
                            formAction={signup}
                            className="bg-transparent border border-[#27272a] text-white font-semibold py-3 rounded-md hover:bg-[#27272a] transition-colors"
                        >
                            Sign Up
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[#27272a]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#09090b] px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#18181b] border border-[#27272a] text-white font-medium py-3 rounded-md hover:bg-[#27272a] transition-colors"
                    >
                        {loading ? "Redirecting..." : (
                            <>
                                <Chrome className="w-4 h-4" />
                                Google
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:flex relative bg-[#18181b] items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-white">
                            <path fillRule="evenodd" d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.887l-15.75 4.375a.75.75 0 01-.973-.732v-5.696a3 3 0 012.176-2.887l15.75-4.375a.75.75 0 01.675.078z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">RJ MUSIC</h2>
                    <p className="text-gray-400 max-w-md text-lg">
                        Manage your products, track orders, and analyze your sales with our powerful admin dashboard.
                    </p>
                </div>
            </div>

        </div>
    );
}
