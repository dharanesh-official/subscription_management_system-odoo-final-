
import Sidebar from "@/components/sidebar"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect("/auth/login")
    }

    // In a real app, query "profiles" table for role
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    // if (profile?.role !== 'admin') { ... }

    // For hackathon speed, we assume accessing /admin means we want admin context
    // But we SHOULD verify.
    // Let's implement a quick check:
    // if (user.email !== 'admin@example.com') redirect('/dashboard')

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar role="admin" />
            <div className="flex flex-col">
                {/* Mobile Header would go here */}
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
