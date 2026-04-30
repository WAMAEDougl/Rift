import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  try {
    const admin = getAdminClient();

    // First count unread notifications
    const { count } = await admin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    // Then update all unread to read
    const { error } = await admin
      .from("notifications")
      .update({ is_read: true } as Record<string, unknown>)
      .eq("is_read", false);

    if (error) {
      return err("Failed to update notifications", "INTERNAL_ERROR", 500);
    }

    return ok({ updated_count: count ?? 0 });
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
