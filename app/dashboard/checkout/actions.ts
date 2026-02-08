'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createSubscriptionAction(formData: FormData) {
    const supabase = await createClient()

    const planId = formData.get('plan_id') as string

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return redirect('/auth/login?error=Please log in to subscribe')
    }

    // 2. Get or Create Customer
    let { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single()

    if (!customer) {
        // Create customer record if missing
        const name = user.user_metadata?.full_name || user.email.split('@')[0]
        const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({
                name: name,
                email: user.email,
                phone: user.phone || null,
            })
            .select()
            .single()

        if (createError) {
            console.error(createError)
            throw new Error('Failed to create customer profile')
        }
        customer = newCustomer
    }

    // 3. Create Subscription (Draft/Quotation)
    // We default to 'quotation' status as per admin flow, or directly 'active' if free trial?
    // Let's assume 'confirmed' or 'active' for self-service to reduce friction, 
    // but typically a payment is needed. Since we don't have a real payment gateway yet,
    // let's set it to 'confirmed' and assume an invoice will be generated.

    // Check if plan has trial
    const { data: plan } = await supabase.from('plans').select('trial_period_days').eq('id', planId).single()
    const status = (plan?.trial_period_days && plan.trial_period_days > 0) ? 'trialing' : 'active'

    // Calculate dates
    const startDate = new Date()
    const validUntil = new Date() // For now just use start date or null

    const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
        customer_id: customer.id,
        plan_id: planId,
        status: status, // Auto-activate for demo purposes
        start_date: startDate.toISOString(),
        currency: 'inr', // Default
        quantity: 1,
        billing_address: 'Default Address' // Placeholder
    }).select().single()

    if (subError) {
        console.error(subError)
        throw new Error('Failed to create subscription')
    }

    revalidatePath('/dashboard')
    return redirect('/dashboard/subscriptions?success=Subscription created')
}
