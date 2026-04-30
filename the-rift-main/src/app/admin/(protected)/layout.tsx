import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/admin/supabase";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <AdminLayoutClient
      role={profile.role as "admin" | "kitchen"}
      userName={userName}
      userRole={profile.role}
    >
      {children}
    </AdminLayoutClient>
  );
}
