
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCustomer(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const street = formData.get('street') as string
    const city = formData.get('city') as string
    const zip = formData.get('zip') as string
    const country = formData.get('country') as string

    // Simple validation
    if (!name || !email) {
        return redirect('/admin/customers/new?error=Name and email are required')
    }

    // Check if profile exists with this email to link automatically
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).single()

    const { error } = await supabase.from('customers').insert({
        profile_id: profile?.id || null, // Link if found
        name,
        email,
        phone,
        address: {
            street,
            city,
            zip,
            country
        }
    })

    if (error) {
        console.error('Create customer error:', error)
        // return { error: 'Could not create customer' } // Ideally handle duplicates
        return redirect('/admin/customers?error=Could not create customer (email exists?)')
    }

    revalidatePath('/admin/customers')
    redirect('/admin/customers')
}
