
import CreatePlanForm from './create-form'
import { createClient } from '@/utils/supabase/server'

export default async function NewPlanPage() {
    const supabase = await createClient()
    const { data: products } = await supabase.from('products').select('id, name').eq('active', true)

    return <CreatePlanForm products={products || []} />
}
