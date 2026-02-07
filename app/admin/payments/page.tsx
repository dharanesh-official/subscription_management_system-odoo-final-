import { getPayments } from "./actions"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Landmark, IndianRupee } from "lucide-react"

export default async function PaymentsPage() {
    const payments = await getPayments()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
                    <p className="text-muted-foreground">Track and manage customer settlements.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Register Payment
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-card shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm uppercase font-semibold">
                        <CreditCard className="h-4 w-4" /> Credit Card
                    </div>
                    <div className="text-2xl font-bold">₹0.00</div>
                </div>
                <div className="border rounded-lg p-4 bg-card shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm uppercase font-semibold">
                        <Landmark className="h-4 w-4" /> Bank Transfer
                    </div>
                    <div className="text-2xl font-bold">₹0.00</div>
                </div>
                <div className="border rounded-lg p-4 bg-card shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm uppercase font-semibold">
                        <IndianRupee className="h-4 w-4" /> Cash / UPI
                    </div>
                    <div className="text-2xl font-bold">₹0.00</div>
                </div>
            </div>

            <div className="border rounded-lg bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No payments registered yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            payments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{payment.customers?.name}</TableCell>
                                    <TableCell>{payment.invoices?.invoice_number || 'N/A'}</TableCell>
                                    <TableCell className="capitalize">{payment.payment_method?.replace('_', ' ')}</TableCell>
                                    <TableCell className="font-semibold text-green-600">₹{payment.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
