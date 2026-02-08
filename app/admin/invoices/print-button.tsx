'use client'

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default function PrintInvoiceButton() {
    return (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
        </Button>
    )
}
