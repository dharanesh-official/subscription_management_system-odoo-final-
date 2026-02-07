
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

export default function CreateSubscriptionForm({ customers, plans }: { customers: any[], plans: any[] }) {
    const [loading, setLoading] = useState(false)
    const [customerId, setCustomerId] = useState('')
    const [planId, setPlanId] = useState('')
    const [status, setStatus] = useState('draft')

    const selectedPlan = plans.find(p => p.id === planId)
    const selectedCustomer = customers.find(c => c.id === customerId)

    return (
        <form action={createSubscription}>
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
                                            <SelectItem key={p.id} value={p.id}>{p.products?.name} - {p.name} (${p.amount}/{p.interval})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            <div className="border-t pt-4 flex justify-between items-center font-bold">
                                <span>Total:</span>
                                <span>${selectedPlan?.amount || '0.00'} <span className="text-xs font-normal text-muted-foreground">/ {selectedPlan?.interval}</span></span>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={!customerId || !planId || loading}>
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
