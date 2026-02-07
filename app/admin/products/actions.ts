
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const active = formData.get('active') === 'on'
    const salesPrice = Number(formData.get('sales_price') || 0)
    const costPrice = Number(formData.get('cost_price') || 0)

    if (!name) {
        return redirect('/admin/products/new?error=Name is required')
    }

    const { error } = await supabase.from('products').insert({
        name,
        description,
        type: type || 'service',
        active,
        sales_price: salesPrice,
        cost_price: costPrice,
    })

    if (error) {
        console.error('Create product error:', error)
        return redirect('/admin/products/new?error=Could not create product')
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const active = formData.get('active') === 'on'
    const salesVal = Number(formData.get('sales_price'))
    const costVal = Number(formData.get('cost_price'))
    // Ensure numeric
    const salesPrice = isNaN(salesVal) ? 0 : salesVal
    const costPrice = isNaN(costVal) ? 0 : costVal

    const { data: updated, error } = await supabase.from('products').update({
        name,
        description,
        type,
        active,
        sales_price: salesPrice,
        cost_price: costPrice,
    }).eq('id', id).select()

    if (error || !updated || updated.length === 0) {
        console.error('Update product error:', error || 'No Permission or ID not found')
        return redirect('/admin/products?error=Update failed. Check permissions.')
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
        console.error('Delete product error:', error)
        if (error.code === '23503') return { error: 'Product used in plans/subscriptions' }
        return { error: 'Could not delete product' }
    }
    return { success: true }

    revalidatePath('/admin/products')
}
