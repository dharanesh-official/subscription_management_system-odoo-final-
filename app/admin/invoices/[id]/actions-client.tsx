
'use client'

import { Button } from "@/components/ui/button"
import { Printer, Send } from "lucide-react"
import { toast } from "sonner"

export default function InvoiceActions({ customerEmail }: { customerEmail: string }) {
    const handlePrint = () => {
        window.print()
    }

    const handleSend = () => {
        // Mock send
        toast.success(`Invoice sent to ${customerEmail}`)
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button onClick={handleSend}>
                <Send className="mr-2 h-4 w-4" /> Send
            </Button>
        </div>
    )
}
