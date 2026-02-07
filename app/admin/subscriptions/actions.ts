
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createSubscription(formData: FormData) {
    const supabase = await createClient()

    const customerId = formData.get('customer_id') as string
    const planId = formData.get('plan_id') as string
    const status = formData.get('status') as string || 'draft'
    const startDate = formData.get('start_date') ? new Date(formData.get('start_date') as string) : new Date()

    if (!customerId || !planId) {
        return { error: 'Customer and Plan are required' }
    }

    // Calculate end date based on plan interval
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()

    if (!plan) return { error: 'Plan not found' }

    let endDate = new Date(startDate)
    // Simple date math
    if (plan.interval === 'monthly') {
        endDate.setMonth(endDate.getMonth() + (plan.interval_count || 1))
    } else if (plan.interval === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + (plan.interval_count || 1))
    } else if (plan.interval === 'weekly') {
        endDate.setDate(endDate.getDate() + (7 * (plan.interval_count || 1)))
    } else {
        endDate.setDate(endDate.getDate() + 1) // daily
    }

    const { data: subscription, error } = await supabase.from('subscriptions').insert({
        customer_id: customerId,
        plan_id: planId,
        status,
        current_period_start: startDate.toISOString(),
        current_period_end: endDate.toISOString(),
    }).select().single()

    if (error) {
        console.error('Create subscription error:', error)
        return { error: 'Could not create subscription' }
    }

    // If status is active, generate the first invoice immediately
    if (status === 'active' && subscription) {
        // Fetch active taxes (basic implementation)
        const { data: taxes } = await supabase.from('taxes').select('percentage').eq('active', true)

        const totalTaxPercent = taxes?.reduce((acc, t) => acc + Number(t.percentage), 0) || 0
        const subAmount = Number(plan.amount)
        const taxAmount = subAmount * (totalTaxPercent / 100)
        const totalAmount = subAmount + taxAmount

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 7) // Due in 7 days by default

        const { error: invError } = await supabase.from('invoices').insert({
            subscription_id: subscription.id,
            customer_id: customerId,
            amount_due: totalAmount,
            currency: 'usd',
            status: 'sent', // Assume sent immediately
            due_date: dueDate.toISOString(),
        })

        if (invError) console.error('Error creating invoice:', invError)
    }

    revalidatePath('/admin/subscriptions')
    // We don't have invoices path yet but good to note
    redirect('/admin/subscriptions')
}

export async function updateSubscriptionStatus(id: string, newStatus: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id)
    if (error) return { error }
    revalidatePath('/admin/subscriptions')
}
