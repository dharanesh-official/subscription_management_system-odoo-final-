import { getTaxes, createTax } from "./actions"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Percent } from "lucide-react"

export default async function TaxesPage() {
    const taxes = await getTaxes()

    // Server-side action wrapper to handle the return type mismatch for the form
    async function handleCreateTax(formData: FormData) {
        'use server'
        await createTax(formData)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tax Management</h1>
                    <p className="text-muted-foreground">Configure GST, VAT, and other service taxes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Add New Tax
                    </h3>
                    <form action={handleCreateTax} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tax Name (e.g. GST 18%)</Label>
                            <Input id="name" name="name" placeholder="Service Tax" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rate">Rate (%)</Label>
                            <Input id="rate" name="rate" type="number" step="0.01" placeholder="18.00" required />
                        </div>
                        <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-md border border-dashed">
                            <input type="checkbox" name="active" id="active" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary" />
                            <Label htmlFor="active" className="cursor-pointer">Active for Invoicing</Label>
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create Tax Rule
                        </Button>
                    </form>
                </div>

                <div className="md:col-span-2 border rounded-lg bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Tax Name</TableHead>
                                <TableHead>Rate (%)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">
                                        No taxes configured. Start by adding one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                taxes.map((tax) => (
                                    <TableRow key={tax.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">{tax.name}</TableCell>
                                        <TableCell className="font-mono">{tax.rate}%</TableCell>
                                        <TableCell>
                                            <Badge active={tax.active}>
                                                {tax.active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, active }: { children: React.ReactNode, active: boolean }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${active
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
            {children}
        </span>
    )
}
