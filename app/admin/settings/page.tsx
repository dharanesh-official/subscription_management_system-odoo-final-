
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Configuration</CardTitle>
                        <CardDescription>Manage global settings for your organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Company Name</Label>
                            <Input disabled defaultValue="SubCheck Inc." />
                        </div>
                        <div className="grid gap-2">
                            <Label>Tax Rate (%)</Label>
                            <Input disabled type="number" defaultValue="10" />
                            <p className="text-xs text-muted-foreground">Default tax applied to all invoices.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>Configure automated email alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="welcome-email" className="flex flex-col space-y-1">
                                <span>Send Welcome Emails</span>
                                <span className="font-normal text-xs text-muted-foreground">Automatically email new customers on signup.</span>
                            </Label>
                            <Switch id="welcome-email" defaultChecked disabled />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="invoice-email" className="flex flex-col space-y-1">
                                <span>Send Invoice PDFs</span>
                                <span className="font-normal text-xs text-muted-foreground">Attach PDF invoices to billing emails.</span>
                            </Label>
                            <Switch id="invoice-email" defaultChecked disabled />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button disabled>Save Changes</Button>
                </div>
            </div>
        </div>
    )
}
