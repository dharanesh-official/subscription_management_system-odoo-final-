import { getQuotationTemplates, createQuotationTemplate } from "./actions"
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
import { FileText, Plus } from "lucide-react"

export default async function QuotationsPage() {
    const templates = await getQuotationTemplates()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotation Templates</h1>
                    <p className="text-muted-foreground">Predefine service bundles and setups for quick sales.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 border rounded-lg p-6 bg-card shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-4">New Template</h3>
                    <form action={async (formData) => {
                        await createQuotationTemplate(formData);
                    }} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input id="name" name="name" placeholder="E-commerce Starter Pack" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="Standard setup for small retailers" />
                        </div>
                        <Button type="submit" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Create
                        </Button>
                    </form>
                </div>

                <div className="md:col-span-3 border rounded-lg bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Template Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Lines</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No quotation templates found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                templates.map((tmpl) => (
                                    <TableRow key={tmpl.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            {tmpl.name}
                                        </TableCell>
                                        <TableCell>{tmpl.description || 'No description'}</TableCell>
                                        <TableCell>0 lines</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">Edit</Button>
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
