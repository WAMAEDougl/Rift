import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  try {
    const admin = getAdminClient();
    const { data: users, error } = await admin
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .in("role", ["admin", "kitchen"])
      .order("created_at", { ascending: false });

    if (error) {
      return err("Failed to fetch users", "INTERNAL_ERROR", 500);
    }

    return ok(users ?? []);
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
