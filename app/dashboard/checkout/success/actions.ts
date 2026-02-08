'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_KEY', {
    apiVersion: '2025-01-27.acacia',
})

export async function handleStripeSuccess(checkoutSessionId: string, subscriptionId: string) {
    const supabase = await createClient()

    try {
        if (checkoutSessionId === 'BYPASS_STRIPE_TEST') {
            console.log("Processing BYPASS payment success...")

            // 1. Update Subscription directly
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    billing_address: 'Bypass Payment - No Address'
                })
                .eq('id', subscriptionId)

            if (updateError) {
                console.error("Failed to update subscription (Bypass)", updateError)
                return { error: "Failed to activate subscription in test mode." }
            }

            // 2. Create Dummy Payment
            const existingPaymentCheck = await supabase.from('payments').select('id').eq('transaction_id', `BYPASS_${subscriptionId}`).maybeSingle()

            if (!existingPaymentCheck.data) {
                const { data: sub } = await supabase.from('subscriptions').select('customer_id, plans(amount)').eq('id', subscriptionId).single()

                if (sub) {
                    const planData = sub.plans as any;
                    await supabase.from('payments').insert({
                        customer_id: sub.customer_id,
                        amount: (Array.isArray(planData) ? planData[0]?.amount : planData?.amount) || 0,
                        payment_date: new Date().toISOString(),
                        payment_method: 'Manual/Bypass',
                        transaction_id: `BYPASS_${subscriptionId}`,
                        status: 'posted'
                    })
                }
            }

            revalidatePath('/dashboard')
            return { success: true }
        }

        const session = await stripe.checkout.sessions.retrieve(checkoutSessionId)

        if (session.payment_status === 'paid') {
            // 1. Verify and Update Subscription
            const { error: updateError } = await supabase
                .from('subscriptions')
                .update({
                    status: 'active',
                    billing_address: session.customer_details?.address?.line1 || 'Stripe Collected'
                })
                .eq('id', subscriptionId)

            if (updateError) {
                console.error("Failed to update subscription", updateError)
                return { error: "Payment received but internal update failed. Contact support." }
            }

            // 2. Create Payment Record (if not already exists via webhook)
            // Check if payment already recorded to avoid dupes
            const { data: existingPayment } = await supabase.from('payments').select('id').eq('transaction_id', session.payment_intent as string).maybeSingle()

            if (!existingPayment) {
                // Fetch sub for info
                const { data: sub } = await supabase.from('subscriptions').select('customer_id, plans(amount)').eq('id', subscriptionId).single()
                if (sub) {
                    const planData = sub.plans as any;
                    await supabase.from('payments').insert({
                        customer_id: sub.customer_id,
                        amount: (Array.isArray(planData) ? planData[0]?.amount : planData?.amount) || session.amount_total || 0,
                        payment_date: new Date().toISOString(),
                        payment_method: 'stripe',
                        transaction_id: session.payment_intent as string,
                        status: 'posted'
                    })
                }
            }

            revalidatePath('/dashboard')
            return { success: true }
        } else {
            return { error: 'Payment not successful' }
        }

    } catch (err: any) {
        console.error("Stripe Verification Error", err)
        return { error: "Verification failed: " + err.message }
    }
}
