
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

import { redirect } from "next/navigation"

import { StripeCheckoutButton } from "./stripe-checkout-button"

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const planId = params.plan as string

    if (!planId) {
        redirect('/pricing')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/login?next=/dashboard/checkout&plan=${planId}`)
    }

    const { data: plan } = await supabase
        .from('plans')
        .select('*, products(*)')
        .eq('id', planId)
        .single()

    if (!plan) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-bold">Plan Not Found</h1>
                    <p className="text-muted-foreground">The plan you are looking for does not exist or is no longer available.</p>
                    <Button variant="outline" asChild>
                        <a href="/pricing">View All Plans</a>
                    </Button>
                </div>
            </div>
        )
    }

    // Server Action import
    const { createSubscriptionAction } = await import('./actions')

    return (
        <div className="container flex min-h-screen items-center justify-center py-12">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Confirm Subscription</CardTitle>
                    <CardDescription>Review your plan details before subscribing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">{plan.products?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg">₹{plan.amount}</div>
                            <div className="text-xs text-muted-foreground capitalize">/ {plan.interval}</div>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date</span>
                            <span>Today</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trial Period</span>
                            <span>{plan.trial_period_days > 0 ? `${plan.trial_period_days} Days` : 'None'}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-medium">
                            <span>Total Due Today</span>
                            <span>{plan.trial_period_days > 0 ? '₹0.00' : `₹${plan.amount}`}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    {plan.trial_period_days > 0 ? (
                        <form action={createSubscriptionAction} className="w-full">
                            <input type="hidden" name="plan_id" value={plan.id} />
                            <Button type="submit" className="w-full" size="lg">
                                Start Free Trial ({plan.trial_period_days} Days)
                            </Button>
                        </form>
                    ) : (
                        <div className="w-full">
                            <StripeCheckoutButton planId={plan.id} amount={plan.amount} />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
