
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
import { Plus, MoreHorizontal } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function PlansPage() {
    const supabase = await createClient()

    // Assuming `product_id` references `products.id`
    const { data: plans } = await supabase.from('plans').select('*, products(name)').order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Billing Plans</h1>
                <Link href="/admin/plans/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Plan
                    </Button>
                </Link>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Plan Name</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Interval</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!plans || plans.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No plans available. Create a product first, then a plan.
                                </TableCell>
                            </TableRow>
                        ) : (plans.map((plan: any) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell>{plan.products?.name || 'Unknown'}</TableCell>
                                <TableCell>{formatCurrency(plan.amount)}</TableCell>
                                <TableCell className="capitalize">{plan.interval}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${plan.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {plan.active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
