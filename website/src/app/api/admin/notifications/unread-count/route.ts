import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  try {
    const admin = getAdminClient();

    const { count } = await admin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    return ok({ count: count ?? 0 });
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
