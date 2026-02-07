
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import InvoiceActions from "./actions-client"

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: invoice } = await supabase
        .from('invoices')
        .select(`
            *,
            customers (*),
            subscriptions (
                *,
                plans (*)
            )
        `)
        .eq('id', id)
        .single()

    if (!invoice) notFound()

    return (
        <div className="max-w-4xl mx-auto p-8 bg-card border shadow-sm rounded-lg mt-8 print:shadow-none print:border-none print:mt-0">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold">INVOICE</h1>
                    <p className="text-muted-foreground font-mono mt-1">#{invoice.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'} className="text-lg px-3 py-1 mb-2 capitalize">
                        {invoice.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">Issued: {new Date(invoice.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <p className="font-medium">{invoice.customers?.name}</p>
                    <p className="text-gray-600">{invoice.customers?.email}</p>
                    {/* Add address if available */}
                </div>
                <div className="text-right">
                    {/* Company Info could go here */}
                    <h3 className="font-semibold text-gray-900 mb-2">Pay To:</h3>
                    <p className="font-medium">Odoo Subscription Manager</p>
                    <p className="text-gray-600">admin@odoo-manager.com</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3">Description</th>
                        <th className="text-right py-3">Qty</th>
                        <th className="text-right py-3">Unit Price</th>
                        <th className="text-right py-3">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100">
                        <td className="py-4">
                            <p className="font-medium">{invoice.subscriptions?.plans?.name}</p>
                            <p className="text-sm text-muted-foreground">{invoice.subscriptions?.plans?.interval} subscription</p>
                        </td>
                        <td className="text-right py-4">{invoice.subscriptions?.quantity || 1}</td>
                        <td className="text-right py-4">{formatCurrency(invoice.subscriptions?.plans?.amount)}</td>
                        <td className="text-right py-4 font-medium">
                            {formatCurrency(Number(invoice.subscriptions?.plans?.amount) * (invoice.subscriptions?.quantity || 1))}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="flex justify-end mb-12">
                <div className="w-1/2 space-y-2">
                    <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">Subtotal</span>
                        <span>{formatCurrency(Number(invoice.subscriptions?.plans?.amount) * (invoice.subscriptions?.quantity || 1))}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-600">Tax (18%)</span>
                        <span>{formatCurrency(Number(invoice.amount_due) - (Number(invoice.subscriptions?.plans?.amount) * (invoice.subscriptions?.quantity || 1)))}</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(invoice.amount_due)}</span>
                    </div>
                </div>
            </div>

            <div className="print:hidden flex justify-between pt-8 border-t">
                <Link href="/admin/invoices">
                    <Button variant="outline">Back to Invoices</Button>
                </Link>
                <InvoiceActions customerEmail={invoice.customers?.email} />
            </div>
        </div>
    )
}
