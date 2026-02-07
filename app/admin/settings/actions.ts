'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
    const supabase = await createClient()
    const { data } = await supabase.from('settings').select('*')

    // Convert array to object for easier use
    const settingsObj: Record<string, string> = {}
    data?.forEach(s => {
        settingsObj[s.key] = s.value
    })
    return settingsObj
}

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()

    const settingsToUpdate = [
        'company_name',
        'default_currency',
        'auto_invoice',
        'send_welcome_email'
    ]

    for (const key of settingsToUpdate) {
        let value = formData.get(key) as string

        // Handle switches/checkboxes which might be null if off
        if ((key === 'auto_invoice' || key === 'send_welcome_email') && !value) {
            value = 'false'
        } else if (value === 'on') {
            value = 'true'
        }

        if (value !== null) {
            await supabase.from('settings').upsert({
                key,
                value,
                updated_at: new Date().toISOString()
            })
        }
    }

    revalidatePath('/admin/settings')
    return { success: true }
}
