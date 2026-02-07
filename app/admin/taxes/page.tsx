import { getTaxes, createTax, toggleTaxStatus } from "./actions"
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
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"

export default async function TaxesPage() {
    const taxes = await getTaxes()

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
                    <h3 className="text-lg font-semibold mb-4">Add New Tax</h3>
                    <form action={async (formData) => {
                        await createTax(formData)
                    }} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Tax Name (e.g. GST 18%)</Label>
                            <Input id="name" name="name" placeholder="Service Tax" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="rate">Rate (%)</Label>
                            <Input id="rate" name="rate" type="number" step="0.01" placeholder="18.00" required />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="active" id="active" defaultChecked className="h-4 w-4" />
                            <Label htmlFor="active">Active</Label>
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create Tax
                        </Button>
                    </form>
                </div>

                <div className="md:col-span-2 border rounded-lg bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tax Name</TableHead>
                                <TableHead>Rate (%)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {taxes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        No taxes configured.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                taxes.map((tax) => (
                                    <TableRow key={tax.id}>
                                        <TableCell className="font-medium">{tax.name}</TableCell>
                                        <TableCell>{tax.rate}%</TableCell>
                                        <TableCell>
                                            <Badge variant={tax.active ? "default" : "secondary"}>
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

function Badge({ children, variant }: { children: React.ReactNode, variant: string }) {
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${variant === 'default' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {children}
        </span>
    )
}
