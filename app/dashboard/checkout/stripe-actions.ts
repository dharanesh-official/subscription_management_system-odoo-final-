'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Stripe from 'stripe'
import { revalidatePath } from "next/cache"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_KEY', {
    apiVersion: '2025-01-27.acacia', // Or latest
})

export async function createStripeSession(planId: string) {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) {
        return { error: 'Please log in to subscribe' }
    }

    // 2. Get Plan
    const { data: plan } = await supabase.from('plans').select('*').eq('id', planId).single()
    if (!plan) return { error: 'Plan not found' }

    // 3. Get or Create Customer (DB)
    let { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user.email)
        .single()

    if (!customer) {
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
            console.error("Stripe Customer Create Error:", createError)
            return { error: 'Failed to create customer profile' }
        }
        customer = newCustomer.data // Fix: insert returns { data: ..., error: ... }
    }

    // 4. Create Subscription (Quotation status)
    // 4. Create Subscription (Quotation status)
    const startDate = new Date().toISOString()
    const { data: subscription, error: subError } = await supabase.from('subscriptions').insert({
        customer_id: customer.id,
        plan_id: planId,
        status: 'quotation',
        current_period_start: startDate
    }).select().single()

    if (subError) {
        console.error("Stripe Subscription Create Error:", subError)
        return { error: 'Failed to create subscription: ' + subError.message }
    }

    // 5. Create Stripe Checkout Session
    // robust origin detection
    let origin = process.env.NEXT_PUBLIC_APP_URL ??
        process.env.NEXT_PUBLIC_VERCEL_URL ??
        'http://localhost:3000'
    origin = origin.includes('http') ? origin : `https://${origin}`
    origin = origin.endsWith('/') ? origin.slice(0, -1) : origin

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'upi'], // Added UPI support for India
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: plan.name,
                            description: plan.description || 'Subscription',
                        },
                        unit_amount: Math.round(plan.amount * 100), // Stripe expects paisa
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Or 'subscription' if using Stripe Subscriptions directly, but here we manage logic ourself
            success_url: `${origin}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}&subscription_id=${subscription.id}`,
            cancel_url: `${origin}/dashboard/checkout?plan=${planId}&error=Payment cancelled`,
            metadata: {
                subscription_id: subscription.id,
                plan_id: planId,
                customer_id: customer.id,
            },
        })

        if (session.url) {
            return { url: session.url }
        } else {
            return { error: 'Failed to create stripe session' }
        }
    } catch (err: any) {
        console.error('Stripe Error:', err)
        return { error: err.message || 'Stripe payment initiation failed' }
    }
}
