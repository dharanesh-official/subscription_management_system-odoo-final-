
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
    const paymentTerms = Number(formData.get('payment_terms') || 7)

    if (!customerId || !planId) {
        return redirect('/admin/subscriptions/new?error=Customer and Plan are required')
    }

    // Calculate end date based on plan interval
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()

    if (!plan) return redirect('/admin/subscriptions/new?error=Plan not found')

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
        payment_terms: paymentTerms,
    }).select().single()

    if (error) {
        console.error('Create subscription error:', error)
        return redirect('/admin/subscriptions/new?error=Could not create subscription')
    }

    // If status is active, generate the first invoice immediately with tax calculation
    if (status === 'active' && subscription) {
        // Fetch active taxes
        const { data: taxes } = await supabase.from('taxes').select('percentage').eq('active', true)

        const totalTaxPercent = taxes?.reduce((acc, t) => acc + Number(t.percentage), 0) || 0
        const subAmount = Number(plan.amount)
        const taxAmount = subAmount * (totalTaxPercent / 100)
        const totalAmount = subAmount + taxAmount

        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + paymentTerms)

        const { error: invError } = await supabase.from('invoices').insert({
            subscription_id: subscription.id,
            customer_id: customerId,
            amount_due: totalAmount,
            currency: 'usd',
            status: 'confirmed',
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

    // 1. Update Status
    const { error } = await supabase.from('subscriptions').update({ status: newStatus }).eq('id', id)
    if (error) {
        console.error('Update subscription error:', error)
        return
    }

    // 2. Generate Invoice if moving to Confirmed/Active and no invoice exists
    if (newStatus === 'confirmed' || newStatus === 'active') {
        const { data: existingInvoice } = await supabase
            .from('invoices')
            .select('id')
            .eq('subscription_id', id)
            .maybeSingle() // Use maybeSingle to avoid 406 error if 0 rows

        if (!existingInvoice) {
            // Fetch Subscription + Plan details
            const { data: sub } = await supabase
                .from('subscriptions')
                .select(`
                    *,
                    plans (
                        amount
                    )
                `)
                .eq('id', id)
                .single()

            if (sub && sub.plans) {
                // @ts-ignore
                const planAmount = Number(sub.plans.amount)

                // Calculate Tax
                const { data: taxes } = await supabase.from('taxes').select('percentage').eq('active', true)
                const totalTaxPercent = taxes?.reduce((acc, t) => acc + Number(t.percentage), 0) || 0
                const taxAmount = planAmount * (totalTaxPercent / 100)
                const totalAmount = planAmount + taxAmount

                const paymentTerms = sub.payment_terms || 7
                const dueDate = new Date()
                dueDate.setDate(dueDate.getDate() + paymentTerms)

                // Create Invoice
                const { error: invError } = await supabase.from('invoices').insert({
                    subscription_id: sub.id,
                    customer_id: sub.customer_id,
                    amount_due: totalAmount,
                    currency: 'usd',
                    status: 'draft', // Initial invoice status
                    due_date: dueDate.toISOString(),
                })

                if (invError) console.error('Auto-invoice generation error:', invError)
            }
        }
    }

    revalidatePath('/admin/subscriptions')
}
