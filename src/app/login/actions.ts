'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in a real app, use Zod for validation
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const next = formData.get('next') as string || '/'

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        redirect(`/login?error=Invalid credentials&next=${next}`)
    }

    revalidatePath('/', 'layout')

    // Check if admin by querying profile role or by email
    if (data.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        if (profile?.role === 'admin' || data.user.email === 'raffyjames65@gmail.com') {
            redirect('/admin/dashboard')
        } else {
            redirect(next)
        }
    } else {
        redirect(next)
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            redirect('/login?error=This email is already registered. Please login instead.')
        }

        // Generic error
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}
