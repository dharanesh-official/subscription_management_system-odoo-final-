
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Check if profile exists, if not create it (handled by trigger usually, but good to be safe)
            return NextResponse.redirect(`${getURL()}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${getURL()}/auth/login?error=Could not authenticate user`)
}

const getURL = () => {
    let url =
        process.env.NEXT_PUBLIC_APP_URL ?? // Set this to your site URL in production env.
        process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
        'http://localhost:3000'
    // Make sure to include `https://` when not localhost.
    url = url.includes('http') ? url : `https://${url}`
    return url
}
