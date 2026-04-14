import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/supabase"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const admin = getAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single()

  if (!profile || !["admin", "kitchen"].includes(profile.role)) redirect("/admin/login")

  const userName = profile.full_name ?? profile.email ?? "Admin"

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf7f2]">
      <AdminSidebar
        role={profile.role as "admin" | "kitchen"}
        userName={userName}
        userRole={profile.role}
      />
      <div className="flex-1 flex flex-col min-w-0 ml-64 h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 lg:p-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  )
}
