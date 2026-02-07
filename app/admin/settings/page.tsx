import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { getSettings, updateSettings } from "./actions"

export default async function SettingsPage() {
    const settings = await getSettings()

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">Manage your subscription engine configuration.</p>

            <form action={async (formData) => {
                await updateSettings(formData)
            }} className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Configuration</CardTitle>
                        <CardDescription>Company branding and base currency.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input
                                id="company_name"
                                name="company_name"
                                defaultValue={settings.company_name || 'SubCheck Inc.'}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="default_currency">Default Currency</Label>
                            <Input
                                id="default_currency"
                                name="default_currency"
                                defaultValue={settings.default_currency || 'inr'}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Automation & Notifications</CardTitle>
                        <CardDescription>Configure background task behaviors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="auto_invoice" className="flex flex-col space-y-1">
                                <span className="text-base">Automatic Invoicing</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Generate invoices automatically when a subscription is activated.
                                </span>
                            </Label>
                            <input
                                type="checkbox"
                                id="auto_invoice"
                                name="auto_invoice"
                                defaultChecked={settings.auto_invoice === 'true'}
                                className="h-5 w-5"
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2 border-t pt-4">
                            <Label htmlFor="send_welcome_email" className="flex flex-col space-y-1">
                                <span className="text-base">Customer Onboarding Emails</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Send a welcome email when a new customer profile is created.
                                </span>
                            </Label>
                            <input
                                type="checkbox"
                                id="send_welcome_email"
                                name="send_welcome_email"
                                defaultChecked={settings.send_welcome_email === 'true'}
                                className="h-5 w-5"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="reset">Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </div>
    )
}
