
import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { Plus, MoreHorizontal, MousePointerClick } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function InvoicesPage() {
    const supabase = await createClient()

    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
      *,
      customers (name, email),
      subscriptions (plan_id, plans(name))
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                <Button disabled variant="outline">
                    Auto-Generated
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No invoices found. Activate a subscription to generate one.
                                </TableCell>
                            </TableRow>
                        ) : (invoices?.map((inv: any) => (
                            <TableRow key={inv.id}>
                                <TableCell className="font-mono text-xs text-muted-foreground uppercase">{inv.id.slice(0, 8)}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{inv.customers?.name}</div>
                                    <div className="text-sm text-muted-foreground">{inv.subscriptions?.plans?.name || 'Manual Charge'}</div>
                                </TableCell>
                                <TableCell className="font-medium">${Number(inv.amount_due).toFixed(2)}</TableCell>
                                <TableCell>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        inv.status === 'paid' ? 'default' :
                                            inv.status === 'confirmed' ? 'default' :
                                                inv.status === 'overdue' ? 'destructive' :
                                                    'secondary'
                                    } className={
                                        inv.status === 'paid' ? 'bg-green-600 hover:bg-green-700' :
                                            inv.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                ''
                                    }>
                                        {inv.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {inv.status === 'draft' && (
                                            <form action={async () => {
                                                'use server'
                                                const supabase = await createClient()
                                                await supabase.from('invoices').update({ status: 'confirmed' }).eq('id', inv.id)
                                                revalidatePath('/admin/invoices')
                                            }}>
                                                <Button size="sm" variant="default">Confirm</Button>
                                            </form>
                                        )}
                                        {(inv.status === 'confirmed' || inv.status === 'sent') && (
                                            <form action={async () => {
                                                'use server'
                                                const supabase = await createClient()
                                                await supabase.from('invoices').update({ status: 'paid' }).eq('id', inv.id)
                                                revalidatePath('/admin/invoices')
                                            }}>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Mark Paid</Button>
                                            </form>
                                        )}
                                        <Link href={`/admin/invoices/${inv.id}`}>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
