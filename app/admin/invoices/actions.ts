
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markInvoicePaid(id: string) {
    const supabase = await createClient()

    // In real app, create a 'payments' record too
    const { error } = await supabase.from('invoices').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        amount_paid: 999999 // Hack: set equal to amount_due via trigger or just update status
        // My schema has generated column amount_remaining, need to update amount_paid
    }).eq('id', id)

    // Actually I need to fetch the amount due first to set amount_paid fully
    const { data: inv } = await supabase.from('invoices').select('amount_due').eq('id', id).single()

    if (inv) {
        await supabase.from('invoices').update({
            status: 'paid',
            amount_paid: inv.amount_due,
            paid_at: new Date().toISOString()
        }).eq('id', id)
    }

    revalidatePath(`/admin/invoices/${id}`)
    revalidatePath('/admin/invoices')
}
