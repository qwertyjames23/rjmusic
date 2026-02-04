"use client";

import { signup } from './actions'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chrome, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

function RegisterForm() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const next = searchParams.get('next') || '/';
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password validation
    const passwordChecks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };

    const isPasswordValid = Object.values(passwordChecks).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

    const handleGoogleSignup = async () => {
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

    const handleSubmit = async (formData: FormData) => {
        if (!isPasswordValid) {
            return;
        }
        if (!passwordsMatch) {
            return;
        }
        setLoading(true);
        await signup(formData);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Create Account
                    </h2>
                    <p className="text-gray-400">
                        Join RJ MUSIC and start your musical journey
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

                    {/* Google Signup */}
                    <button
                        onClick={handleGoogleSignup}
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
                            <span className="bg-[#0f141a] px-3 text-gray-500 font-medium">Or register with email</span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form action={handleSubmit} className="space-y-4">
                        <input type="hidden" name="next" value={next} />

                        {/* Full Name Field */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="fullName">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#1c222b] border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-gray-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password.length > 0 && (
                                <div className="mt-3 space-y-1.5 animate-in slide-in-from-top-2">
                                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.length ? 'text-green-400' : 'text-gray-500'}`}>
                                        {passwordChecks.length ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                                        {passwordChecks.uppercase ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                                        One uppercase letter
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                                        {passwordChecks.lowercase ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                                        One lowercase letter
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.number ? 'text-green-400' : 'text-gray-500'}`}>
                                        {passwordChecks.number ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                                        One number
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-300" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full bg-[#1c222b] border rounded-xl pl-11 pr-12 py-3.5 text-white placeholder:text-gray-500 focus:ring-2 transition-all outline-none ${confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                                            : 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-white/10 focus:border-primary focus:ring-primary/20'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && !passwordsMatch && (
                                <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                                    <X className="size-3.5" />
                                    Passwords do not match
                                </p>
                            )}
                            {passwordsMatch && (
                                <p className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
                                    <Check className="size-3.5" />
                                    Passwords match
                                </p>
                            )}
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="terms"
                                name="terms"
                                required
                                className="mt-1 size-4 rounded border-gray-600 bg-[#1c222b] text-primary focus:ring-primary/20"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-400">
                                I agree to the{' '}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid || !passwordsMatch}
                                className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                            >
                                {loading ? (
                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
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

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#0a0a0f] to-[#050505] flex items-center justify-center">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}
