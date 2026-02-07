'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPayment(formData: FormData) {
    const supabase = await createClient()

    const invoiceId = formData.get('invoice_id') as string
    const customerId = formData.get('customer_id') as string
    const amount = Number(formData.get('amount'))
    const method = formData.get('payment_method') as string
    const date = formData.get('payment_date') as string
    const transactionId = formData.get('transaction_id') as string

    const { error } = await supabase.from('payments').insert({
        invoice_id: invoiceId || null,
        customer_id: customerId,
        amount,
        payment_method: method,
        payment_date: date,
        transaction_id: transactionId,
        status: 'posted'
    })

    if (error) {
        console.error('Payment creation error:', error)
        return { error: error.message }
    }

    // If invoice ID is provided, mark invoice as paid? 
    // Usually, we'd check if total payments >= invoice total.
    if (invoiceId) {
        await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoiceId)
    }

    revalidatePath('/admin/payments')
    revalidatePath('/admin/invoices')
    return { success: true }
}

export async function getPayments() {
    const supabase = await createClient()
    const { data: payments } = await supabase
        .from('payments')
        .select(`
            *,
            customers (name),
            invoices (invoice_number)
        `)
        .order('created_at', { ascending: false })
    return payments || []
}
