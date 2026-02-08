'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDiscounts() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('discounts')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
    return data || []
}

export async function createDiscount(formData: FormData) {
    const supabase = await createClient()

    // Admin check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('Create discount error: No authenticated user')
        const { redirect } = await import('next/navigation')
        return redirect(`/admin/discounts?error=${encodeURIComponent('Unauthorized - Please log in')}`)
    }

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (profileError) {
        console.error('Profile fetch error:', profileError)
        const { redirect } = await import('next/navigation')
        return redirect(`/admin/discounts?error=${encodeURIComponent('Error fetching user profile')}`)
    }

    if (profile?.role !== 'admin') {
        console.error('Create discount error: User is not admin, role:', profile?.role)
        const { redirect } = await import('next/navigation')
        return redirect(`/admin/discounts?error=${encodeURIComponent('Only admins can create discounts')}`)
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as 'percentage' | 'fixed'
    const value = Number(formData.get('value'))
    const min_amount = Number(formData.get('min_amount') || 0)
    const active = formData.get('active') === 'on'
    const valid_from = formData.get('valid_from') as string
    const valid_until = formData.get('valid_until') as string
    const product_id = formData.get('product_id') as string

    console.log('Creating discount with data:', {
        name,
        type,
        value,
        min_amount,
        active,
        valid_from,
        valid_until,
        product_id: (product_id && product_id !== 'all') ? product_id : null
    })

    // TEMPORARY FIX: Insert without code column
    // Run EMERGENCY_FIX_NOW.sql in Supabase to properly fix the database
    const { error, data } = await supabase.from('discounts').insert({
        name,
        description: description || null,
        type,
        value,
        min_amount,
        active,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        product_id: (product_id && product_id !== 'all') ? product_id : null
    }).select()

    if (error) {
        console.error('Create discount error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        // Redirect back with error so the UI can show feedback
        const { redirect } = await import('next/navigation')
        return redirect(`/admin/discounts?error=${encodeURIComponent(error.message)}`)
    }

    console.log('Discount created successfully:', data)
    revalidatePath('/admin/discounts')
    const { redirect } = await import('next/navigation')
    return redirect('/admin/discounts?success=1')
}

export async function toggleDiscountStatus(id: string, active: boolean) {
    const supabase = await createClient()
    await supabase.from('discounts').update({ active }).eq('id', id)
    revalidatePath('/admin/discounts')
}

export async function updateDiscount(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as 'percentage' | 'fixed'
    const value = Number(formData.get('value'))
    const min_amount = Number(formData.get('min_amount') || 0)
    const active = formData.get('active') === 'on'
    const valid_from = formData.get('valid_from') as string
    const valid_until = formData.get('valid_until') as string
    const product_id = formData.get('product_id') as string

    const { error } = await supabase.from('discounts').update({
        name,
        description: description || null,
        type,
        value,
        min_amount,
        active,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        product_id: (product_id && product_id !== 'all') ? product_id : null
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/discounts')
    return { success: true }
}

export async function deleteDiscount(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('discounts').delete().eq('id', id)

    if (error) {
        if (error.code === '23503') return { error: 'Discount is linked to plans' }
        return { error: error.message }
    }

    revalidatePath('/admin/discounts')
    return { success: true }
}
