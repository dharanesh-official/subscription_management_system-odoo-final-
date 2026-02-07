'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createQuotationTemplate(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const validity_days = Number(formData.get('validity_days') || 15)

    const { error } = await supabase.from('quotation_templates').insert({
        name,
        description,
        validity_days
    })
    if (error) return { error: error.message }
    revalidatePath('/admin/quotations')
    return { success: true }
}

export async function getQuotationTemplates() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('quotation_templates')
        .select(`
            *,
            quotation_template_lines (
                id,
                quantity,
                products (name)
            )
        `)
    return data || []
}

export async function addTemplateLine(templateId: string, productId: string, quantity: number) {
    const supabase = await createClient()
    const { error } = await supabase.from('quotation_template_lines').insert({
        template_id: templateId,
        product_id: productId,
        quantity: quantity
    })
    if (error) return { error: error.message }
    revalidatePath('/admin/quotations')
    return { success: true }
}
