
import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import EditPlanForm from "./edit-form"

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: plan } = await supabase
        .from('plans')
        .select(`
            *,
            products (
                name,
                type
            )
        `)
        .eq('id', id)
        .single()

    if (!plan) {
        notFound()
    }

    return <EditPlanForm plan={plan} />
}
