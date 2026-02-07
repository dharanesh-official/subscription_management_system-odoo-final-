
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
import { Plus, MoreHorizontal, FileText, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function SubscriptionsPage() {
    const supabase = await createClient()

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select(`
      *,
      customers (name, email),
      plans (name, amount, interval, products(name))
    `)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
                <Link href="/admin/subscriptions/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Subscription
                    </Button>
                </Link>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Plan Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Billing Cycle</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No subscriptions found. Create a quotation first.
                                </TableCell>
                            </TableRow>
                        ) : (subscriptions?.map((sub: any) => (
                            <TableRow key={sub.id}>
                                <TableCell>
                                    <div className="font-medium">{sub.customers?.name}</div>
                                    <div className="text-sm text-muted-foreground">{sub.customers?.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{sub.plans?.products?.name}</div>
                                    <div className="text-sm text-muted-foreground">{sub.plans?.name}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        sub.status === 'active' ? 'default' :
                                            sub.status === 'confirmed' ? 'default' :
                                                sub.status === 'closed' ? 'secondary' :
                                                    'outline'
                                    } className={
                                        sub.status === 'active' ? 'bg-green-600 hover:bg-green-700' :
                                            sub.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                sub.status === 'closed' ? 'bg-gray-600' :
                                                    ''
                                    }>
                                        {sub.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        {new Date(sub.current_period_start).toLocaleDateString()} - <br />
                                        {new Date(sub.current_period_end).toLocaleDateString()}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">${sub.plans?.amount} / {sub.plans?.interval}</TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {sub.status === 'draft' && (
                                            <form action={async () => {
                                                'use server'
                                                const supabase = await createClient()
                                                await supabase.from('subscriptions').update({ status: 'quotation' }).eq('id', sub.id)
                                                revalidatePath('/admin/subscriptions')
                                            }}>
                                                <Button size="sm" variant="outline">Convert to Quotation</Button>
                                            </form>
                                        )}
                                        {sub.status === 'quotation' && (
                                            <form action={async () => {
                                                'use server'
                                                const supabase = await createClient()
                                                await supabase.from('subscriptions').update({ status: 'confirmed' }).eq('id', sub.id)
                                                revalidatePath('/admin/subscriptions')
                                            }}>
                                                <Button size="sm" variant="default">Confirm</Button>
                                            </form>
                                        )}
                                        {sub.status === 'confirmed' && (
                                            <form action={async () => {
                                                'use server'
                                                const supabase = await createClient()
                                                await supabase.from('subscriptions').update({ status: 'active' }).eq('id', sub.id)
                                                revalidatePath('/admin/subscriptions')
                                            }}>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700">Activate</Button>
                                            </form>
                                        )}
                                        {sub.status === 'active' && (
                                            <form action={async () => {
                                                'use server'
                                                const supabase = await createClient()
                                                await supabase.from('subscriptions').update({ status: 'closed' }).eq('id', sub.id)
                                                revalidatePath('/admin/subscriptions')
                                            }}>
                                                <Button size="sm" variant="destructive">Close</Button>
                                            </form>
                                        )}
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
