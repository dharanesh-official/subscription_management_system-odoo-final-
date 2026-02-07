
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { sendWelcomeEmail } from '@/utils/mail'

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
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('first-name') as string
    const lastName = formData.get('last-name') as string

    // Password validation
    if (password.length <= 8) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must be longer than 8 characters')}`)
    }
    if (!/[A-Z]/.test(password)) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must contain at least one uppercase letter')}`)
    }
    if (!/[a-z]/.test(password)) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must contain at least one lowercase letter')}`)
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return redirect(`/auth/signup?error=${encodeURIComponent('Password must contain at least one special character')}`)
    }

    const fullName = `${firstName} ${lastName}`.trim()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: 'customer' // Default role
            },
            emailRedirectTo: `${origin}/auth/callback?flow=signup`
        },
    })

    if (error) {
        console.error("Signup Error:", error.message)
        return redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
    }

    // If email confirmation is disabled, user is signed in immediately
    if (data.session) {
        sendWelcomeEmail(email, fullName).catch(e => console.error(e))
        revalidatePath('/', 'layout')
        redirect('/dashboard')
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
            redirectTo: `${origin}/auth/callback?flow=google-signup`,
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

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
    })

    if (error) {
        console.error("Forgot Password Error:", error.message)
        return redirect(`/auth/forgot-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/auth/forgot-password?message=Check your email for the reset link')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return redirect(`/auth/update-password?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
