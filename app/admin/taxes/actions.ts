'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTax(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const rate = Number(formData.get('rate'))
    const active = formData.get('active') === 'on'

    const { error } = await supabase.from('taxes').insert({ name, rate, active })
    if (error) return { error: error.message }
    revalidatePath('/admin/taxes')
    return { success: true }
}

export async function getTaxes() {
    const supabase = await createClient()
    const { data } = await supabase.from('taxes').select('*').order('created_at', { ascending: false })
    return data || []
}

export async function toggleTaxStatus(id: string, active: boolean) {
    const supabase = await createClient()
    await supabase.from('taxes').update({ active }).eq('id', id)
    revalidatePath('/admin/taxes')
}
