'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDiscounts() {
    const supabase = await createClient()
    const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false })
    return data || []
}

export async function createDiscount(formData: FormData) {
    const supabase = await createClient()

    // Admin check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Only admins can create discounts' }

    const name = formData.get('name') as string
    const type = formData.get('type') as 'percentage' | 'fixed'
    const value = Number(formData.get('value'))
    const min_amount = Number(formData.get('min_amount') || 0)
    const active = formData.get('active') === 'on'

    const { error } = await supabase.from('discounts').insert({
        name,
        type,
        value,
        min_amount,
        active
    })

    if (error) return { error: error.message }

    revalidatePath('/admin/discounts')
    return { success: true }
}

export async function toggleDiscountStatus(id: string, active: boolean) {
    const supabase = await createClient()
    await supabase.from('discounts').update({ active }).eq('id', id)
    revalidatePath('/admin/discounts')
}
