
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPlan(formData: FormData) {
    const supabase = await createClient()

    const productId = formData.get('product_id') as string
    const name = formData.get('name') as string
    const amount = Number(formData.get('amount'))
    const interval = formData.get('interval') as string
    const trialPeriod = Number(formData.get('trial_period_days') || 0)
    const active = formData.get('active') === 'on'

    if (!productId || !name || isNaN(amount)) {
        return { error: 'Missing required fields' }
    }

    const { error } = await supabase.from('plans').insert({
        product_id: productId,
        name,
        amount,
        interval, // Ensure this matches DB enum strictly
        trial_period_days: trialPeriod,
        active,
        currency: 'usd'
    })

    if (error) {
        console.error('Create plan error:', error)
        return { error: 'Could not create plan' }
    }

    revalidatePath('/admin/plans')
    redirect('/admin/plans')
}

export async function deletePlan(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('plans').delete().eq('id', id)

    if (error) {
        return { error: 'Could not delete plan' }
    }

    revalidatePath('/admin/plans')
}
