
import { createClient } from "@/utils/supabase/server"
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
                                    <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'overdue' ? 'destructive' : 'secondary'}>
                                        {inv.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Link href={`/admin/invoices/${inv.id}`}>
                                        <Button variant="ghost" size="icon">
                                            <MousePointerClick className="h-4 w-4" />
                                            <span className="sr-only">View</span>
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
