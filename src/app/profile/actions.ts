'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Not authenticated' }
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const gender = formData.get('gender') as string
    const birthDate = formData.get('birthDate') as string

    // Update user metadata in Supabase Auth
    const { error: metadataError } = await supabase.auth.updateUser({
        data: {
            full_name: fullName,
            phone: phone,
            gender: gender,
            birth_date: birthDate,
        }
    })

    if (metadataError) {
        return { error: metadataError.message }
    }

    // Update profile in database (only use columns that exist)
    // Note: phone, gender, birth_date are stored in auth metadata only
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: fullName,
            email: user.email,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'id'
        })

    if (profileError) {
        console.error('Profile update error:', profileError)
        // Don't fail - metadata was saved at least
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function getProfile() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Not authenticated', profile: null }
    }

    // Try to get profile from database
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        profile: profile || {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email,
            phone: user.user_metadata?.phone || '',
            gender: user.user_metadata?.gender || '',
            birth_date: user.user_metadata?.birth_date || '',
        },
        user
    }
}
