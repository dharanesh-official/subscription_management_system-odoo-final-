
import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, CheckCircle2 } from "lucide-react"
import { markInvoicePaid } from "../actions"

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: invoice } = await supabase
        .from('invoices')
        .select(`
      *,
      customers (name, email, address, phone),
      subscriptions (
        current_period_start, 
        current_period_end,
        plans (name, amount, interval, products(name))
      )
    `)
        .eq('id', params.id)
        .single()

    if (!invoice) return <div>Invoice not found</div>

    const isPaid = invoice.status === 'paid'

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between print:hidden">
                <div className="flex gap-2 items-center">
                    <h1 className="text-2xl font-bold">Invoice #{invoice.id.slice(0, 8)}</h1>
                    <Badge variant={isPaid ? 'default' : 'outline'} className={isPaid ? 'bg-green-600' : ''}>
                        {invoice.status.toUpperCase()}
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <form action={async () => {
                        'use server'
                        await markInvoicePaid(invoice.id)
                    }}>
                        {!isPaid && <Button variant="outline"><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Paid</Button>}
                    </form>
                    <Button variant="secondary"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
            </div>

            <div className="bg-card border rounded-lg p-10 shadow-sm print:shadow-none print:border-none">
                <div className="flex justify-between mb-10">
                    <div>
                        <div className="text-2xl font-bold text-primary mb-2">SubCheck Inc.</div>
                        <div className="text-sm text-muted-foreground">
                            123 Innovation Drive<br />
                            San Francisco, CA 94103<br />
                            USA
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold mb-2">INVOICE</h2>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
                            <p>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bill To</h3>
                        <div className="font-medium">{invoice.customers?.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {invoice.customers?.email}<br />
                            {invoice.customers?.phone || ''}
                        </div>
                        {/* Address rendering logic if JSON exists */}
                    </div>
                    <div>
                        {/* Payment details could go here */}
                    </div>
                </div>

                <table className="w-full mb-8">
                    <thead className="border-b">
                        <tr>
                            <th className="text-left py-3 font-semibold text-sm">Description</th>
                            <th className="text-right py-3 font-semibold text-sm">Qty</th>
                            <th className="text-right py-3 font-semibold text-sm">Unit Price</th>
                            <th className="text-right py-3 font-semibold text-sm">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        <tr>
                            <td className="py-4">
                                <div className="font-medium text-sm">
                                    {invoice.subscriptions?.plans?.products?.name || 'Service'} - {invoice.subscriptions?.plans?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Period: {new Date(invoice.subscriptions?.current_period_start).toLocaleDateString()} to {new Date(invoice.subscriptions?.current_period_end).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="text-right py-4 text-sm">1</td>
                            <td className="text-right py-4 text-sm">${invoice.subscriptions?.plans?.amount}</td>
                            <td className="text-right py-4 font-medium text-sm">${invoice.subscriptions?.plans?.amount}</td>
                        </tr>
                        {/* Tax row if applicable */}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-[200px] space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${Number(invoice.amount_due).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span>$0.00</span>
                            {/* Simplified tax handling in UI for now */}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${Number(invoice.amount_due).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t text-sm text-muted-foreground text-center">
                    Thank you for your business. Please pay within 7 days.
                </div>
            </div>
        </div>
    )
}
