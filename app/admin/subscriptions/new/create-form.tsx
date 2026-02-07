
'use client'

import { createSubscription } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useState } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export default function CreateSubscriptionForm({ customers, plans }: { customers: any[], plans: any[] }) {
    const [loading, setLoading] = useState(false)
    const [customerId, setCustomerId] = useState('')
    const [planId, setPlanId] = useState('')
    const [status, setStatus] = useState('draft')
    const [quantity, setQuantity] = useState(1)

    const selectedPlan = plans.find(p => p.id === planId)
    const selectedCustomer = customers.find(c => c.id === customerId)

    // Calculate Estimates
    const amount = Number(selectedPlan?.amount || 0) * quantity
    const taxRate = 0.18 // Estimated GST 18% as per Indian Rules logic
    const taxAmount = amount * taxRate
    const totalAmount = amount + taxAmount

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        await createSubscription(formData)
    }

    return (
        <form action={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-card rounded-lg border shadow-sm">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight">New Subscription</h1>
                            <p className="text-muted-foreground text-sm">Create a quotation or activate a plan for a customer.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="customer">Customer</Label>
                                <input type="hidden" name="customer_id" value={customerId} />
                                <Select value={customerId} onValueChange={setCustomerId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.length === 0 ? <SelectItem value="none" disabled>No customers found</SelectItem> : customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name} ({c.email})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-sm text-muted-foreground flex justify-end">
                                    <Link href="/admin/customers/new" className="text-primary hover:underline">+ New Customer</Link>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="plan">Subscription Plan</Label>
                                <input type="hidden" name="plan_id" value={planId} />
                                <Select value={planId} onValueChange={setPlanId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a plan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.length === 0 ? <SelectItem value="none" disabled>No active plans</SelectItem> : plans.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.products?.name} - {p.name} ({formatCurrency(p.amount)}/{p.interval})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Initial Status</Label>
                                    <input type="hidden" name="status" value={status} />
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft (Quotation)</SelectItem>
                                            <SelectItem value="active">Active (Bill Now)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" name="start_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
                                <Input
                                    id="payment_terms"
                                    name="payment_terms"
                                    type="number"
                                    min="0"
                                    defaultValue="7"
                                    placeholder="Number of days until payment is due"
                                />
                                <p className="text-xs text-muted-foreground">Invoices will be due this many days after generation</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                            <CardDescription>Estimated billing details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Customer:</span>
                                <span className="font-medium truncate max-w-[150px]">{selectedCustomer?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-medium truncate max-w-[150px]">{selectedPlan?.name || '-'}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Subtotal ({quantity} x {formatCurrency(Number(selectedPlan?.amount || 0))}):</span>
                                    <span>{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>GST (18% Est.):</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                            </div>
                            <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                                <span>Total:</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={!customerId || !planId || loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {status === 'active' ? 'Verify & Activate' : 'Create Quotation'}
                                </Button>
                                <Link href="/admin/subscriptions">
                                    <Button variant="ghost" className="w-full mt-2" type="button">Cancel</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
