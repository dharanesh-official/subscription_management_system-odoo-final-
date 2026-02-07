
'use client'

import { createPlan } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useState } from "react"
import Link from "next/link"

export default function CreatePlanForm({ products }: { products: any[] }) {
    const [loading, setLoading] = useState(false)
    const [productId, setProductId] = useState('')
    const [interval, setInterval] = useState('monthly')

    return (
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg border shadow-sm mt-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">New Plan</h1>
                <p className="text-muted-foreground text-sm">Define billing paramaters for a product.</p>
            </div>

            <form action={createPlan} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="product">Base Product</Label>
                    <input type="hidden" name="product_id" value={productId} />
                    <Select value={productId} onValueChange={setProductId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a product..." />
                        </SelectTrigger>
                        <SelectContent>
                            {products.length === 0 ? <SelectItem value="none" disabled>No products found</SelectItem> : products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.type})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Plan Name</Label>
                    <Input id="name" name="name" placeholder="e.g. Starter Monthly" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Price (INR)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                            <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" className="pl-7" required />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="interval">Billing Interval</Label>
                        <input type="hidden" name="interval" value={interval} />
                        <Select value={interval} onValueChange={setInterval}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                    <div className="grid gap-2">
                        <Label htmlFor="min_quantity">Minimum Quantity</Label>
                        <Input id="min_quantity" name="min_quantity" type="number" min="1" defaultValue="1" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="trial">Trial Days</Label>
                        <Input id="trial" name="trial_period_days" type="number" min="0" defaultValue="0" />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <Label>Plan Options</Label>
                    <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="active" id="active" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                            <Label htmlFor="active" className="font-medium cursor-pointer">Active Status</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="auto_close" id="auto_close" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                            <Label htmlFor="auto_close" className="font-medium cursor-pointer">Auto-close</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="closable" id="closable" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                            <Label htmlFor="closable" className="font-medium cursor-pointer">Closable</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="pausable" id="pausable" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                            <Label htmlFor="pausable" className="font-medium cursor-pointer">Pausable</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" name="renewable" id="renewable" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" defaultChecked />
                            <Label htmlFor="renewable" className="font-medium cursor-pointer">Renewable</Label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <Link href="/admin/plans">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={loading || !productId}>
                        {loading ? 'Saving...' : 'Create Plan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
