
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendInvoiceEmail } from '@/lib/email'

export async function markInvoicePaid(id: string) {
    const supabase = await createClient()

    // Fetch the amount due first to set amount_paid fully
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

export async function sendInvoiceManually(invoiceId: string) {
    const supabase = await createClient()

    // Fetch complete invoice data with customer and subscription details
    const { data: invoice } = await supabase
        .from('invoices')
        .select(`
            *,
            customers (name, email),
            subscriptions (
                quantity,
                plans (name, amount)
            )
        `)
        .eq('id', invoiceId)
        .single()

    if (!invoice || !invoice.customers?.email) {
        return { success: false, error: 'Invoice or customer email not found' }
    }

    // Calculate breakdown
    const quantity = invoice.subscriptions?.quantity || 1
    const planAmount = Number(invoice.subscriptions?.plans?.amount || 0)
    const subtotal = planAmount * quantity
    const total = Number(invoice.amount_due)
    const tax = total - subtotal

    try {
        const result = await sendInvoiceEmail({
            customerName: invoice.customers.name,
            customerEmail: invoice.customers.email,
            invoiceId: invoice.id,
            invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
            amount: total,
            dueDate: invoice.due_date,
            planName: invoice.subscriptions?.plans?.name || 'Service',
            quantity: quantity,
            subtotal: subtotal,
            tax: tax,
            total: total,
        })

        if (result.success) {
            // Update invoice status to 'sent' if it was 'draft'
            if (invoice.status === 'draft') {
                await supabase
                    .from('invoices')
                    .update({ status: 'sent' })
                    .eq('id', invoiceId)
            }

            revalidatePath(`/admin/invoices/${invoiceId}`)
            revalidatePath('/admin/invoices')
        }

        return result
    } catch (error) {
        console.error('Error sending invoice email:', error)
        return { success: false, error: String(error) }
    }
}
