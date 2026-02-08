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

            // Helper to get admin client if available to bypass RLS
            const getAdminClient = () => {
                if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                    try {
                        const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
                        return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
                    } catch (e) {
                        console.error("Could not load @supabase/supabase-js", e)
                        return null
                    }
                }
                return null
            }

            const adminDb = getAdminClient() || supabase

            // 0. Fetch Subscription details first (we need customer_id and amount)
            const { data: sub, error: fetchError } = await adminDb
                .from('subscriptions')
                .select('customer_id, plans(amount)')
                .eq('id', subscriptionId)
                .single()

            if (fetchError || !sub) {
                console.error("Bypass Error: Could not fetch subscription", fetchError)
                return { error: "Could not verify subscription details." }
            }

            const planData = sub.plans as any
            const amount = Number((Array.isArray(planData) ? planData[0]?.amount : planData?.amount) || 0)

            // 1. Update Subscription directly
            const { error: updateError } = await adminDb
                .from('subscriptions')
                .update({
                    status: 'active'
                })
                .eq('id', subscriptionId)

            if (updateError) {
                console.error("Failed to update subscription (Bypass)", updateError)
                // If this fails, we probably can't proceed, but we'll try to ensure we don't block everything if it's just a "field not found" issue
                return { error: "Failed to activate subscription. " + updateError.message }
            }

            // 2. Create Invoice
            // We create a paid invoice immediately
            const { data: newInvoice, error: invError } = await adminDb
                .from('invoices')
                .insert({
                    customer_id: sub.customer_id,
                    subscription_id: subscriptionId,
                    amount_due: amount,
                    amount_paid: amount,
                    status: 'paid',
                    paid_at: new Date().toISOString(),
                    due_date: new Date().toISOString(),
                })
                .select()
                .single()

            if (invError) {
                console.error("Failed to generate invoice", invError)
                // Non-blocking, but bad.
            }

            // 3. Create Payment
            // If invoice was created, link it. Otherwise just record payment.
            const transactionId = `BYPASS_${subscriptionId}`
            const existingPaymentCheck = await adminDb.from('payments').select('id').eq('transaction_id', transactionId).maybeSingle()

            if (!existingPaymentCheck.data) {
                await adminDb.from('payments').insert({
                    customer_id: sub.customer_id,
                    invoice_id: newInvoice?.id || null,
                    amount: amount,
                    payment_date: new Date().toISOString(),
                    payment_method: 'Manual/Bypass',
                    transaction_id: transactionId,
                    status: 'posted'
                })
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
                    status: 'active'
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
