import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/admin/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check for hardcoded session cookie first
  const cookieStore = await cookies();
  const hardcodedSession = cookieStore.get("admin_hardcoded_session");

  if (hardcodedSession) {
    try {
      const profile = JSON.parse(hardcodedSession.value);
      const userName = profile.full_name ?? profile.email ?? "Admin";

      return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
          <AdminSidebar
            role={profile.role as "admin" | "kitchen"}
            userName={userName}
            userRole={profile.role}
          />
          <div className="flex-1 flex flex-col min-w-0 ml-64 h-screen overflow-hidden">
            <AdminTopbar
              user={{ name: userName, role: profile.role as "admin" | "kitchen" }}
            />
            <main className="flex-1 overflow-y-auto p-8 lg:p-10">{children}</main>
          </div>
        </div>
      );
    } catch {
      // Invalid cookie, continue to Supabase check
    }
  }

  // Fallback to Supabase auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "kitchen"].includes(profile.role)) {
    redirect("/admin/login");
  }

  const userName = profile.full_name ?? profile.email ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <AdminSidebar
        role={profile.role as "admin" | "kitchen"}
        userName={userName}
        userRole={profile.role}
      />
      <div className="flex-1 flex flex-col min-w-0 ml-64 h-screen overflow-hidden">
        <AdminTopbar
          user={{ name: userName, role: profile.role as "admin" | "kitchen" }}
        />
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
