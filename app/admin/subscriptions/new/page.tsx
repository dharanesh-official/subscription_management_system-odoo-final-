
import CreateSubscriptionForm from './create-form'
import { createClient } from '@/utils/supabase/server'

export default async function NewSubscriptionPage() {
    const supabase = await createClient()

    const [customers, plans] = await Promise.all([
        supabase.from('customers').select('id, name, email').order('created_at', { ascending: false }),
        supabase.from('plans').select('id, name, amount, interval, products(name)').eq('active', true).order('created_at', { ascending: false })
    ])

    return (
        <CreateSubscriptionForm
            customers={customers.data || []}
            plans={plans.data || []}
        />
    )
}
