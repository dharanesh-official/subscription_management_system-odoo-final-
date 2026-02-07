
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Basic role check - in a real app query profiles table
    // For hackathon speed, we use metadata or assume based on email/role
    let redirectUrl = '/dashboard' // Default

    if (error) {
        console.error("Login Error:", error.message) // Debugging for user
        // Map common errors to user-friendly messages
        let message = error.message
        if (error.message === 'Invalid login credentials') {
            message = 'Invalid email or password. (Check if email is confirmed)'
        }
        return redirect(`/auth/login?error=${encodeURIComponent(message)}`)
    }

    revalidatePath('/', 'layout')
    redirect(redirectUrl)
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first-name') as string
    const lastName = formData.get('last-name') as string

    const fullName = `${firstName} ${lastName}`.trim()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: 'customer' // Default role
            },
        },
    })

    if (error) {
        console.error("Signup Error:", error.message)
        return redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/auth/verify-email')
}

export async function loginWithGoogle() {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        console.error(error)
        redirect('/auth/login?error=Could not authenticate with Google')
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}
