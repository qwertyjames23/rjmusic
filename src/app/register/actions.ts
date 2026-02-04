'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get('origin') || 'http://localhost:3000'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    // Validate inputs
    if (!email || !password) {
        redirect('/register?error=Email and password are required')
    }

    // Password validation
    if (password.length < 8) {
        redirect('/register?error=Password must be at least 8 characters')
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                display_name: fullName,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            redirect('/register?error=This email is already registered. Please login instead.')
        }

        if (error.message.includes('rate limit')) {
            redirect('/register?error=Too many attempts. Please try again in a few minutes.')
        }

        // Generic error
        redirect(`/register?error=${encodeURIComponent(error.message)}`)
    }

    // Check if email confirmation is required
    if (data?.user?.identities?.length === 0) {
        // User already exists but hasn't confirmed email
        redirect('/register?error=This email is already registered. Please check your email to confirm.')
    }

    // Try to create profile (may fail due to RLS - that's okay, trigger will handle it)
    if (data.user) {
        try {
            await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    full_name: fullName,
                    email: email,
                    role: 'customer',
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'id'
                })
        } catch {
            // Profile will be created by database trigger instead
            console.log('Profile will be created by database trigger')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/register?message=Check your email to confirm your account!')
}
