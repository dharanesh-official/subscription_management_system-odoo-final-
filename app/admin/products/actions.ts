
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

    if (!name) {
        return { error: 'Name is required' }
    }

    const { error } = await supabase.from('products').insert({
        name,
        description,
        type: type || 'service',
        active,
    })

    if (error) {
        console.error('Create product error:', error)
        return { error: 'Could not create product' }
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

    const { error } = await supabase.from('products').update({
        name,
        description,
        type,
        active,
    }).eq('id', id)

    if (error) {
        return { error: 'Could not update product' }
    }

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function deleteProduct(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
        return { error: 'Could not delete product' }
    }

    revalidatePath('/admin/products')
}
