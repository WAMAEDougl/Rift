import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/supabase"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

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

  return (
    <div className="flex h-full">
      <AdminSidebar role={profile.role as "admin" | "kitchen"} />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar
          user={{
            name: profile.full_name ?? profile.email ?? "Admin",
            role: profile.role as "admin" | "kitchen",
          }}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
