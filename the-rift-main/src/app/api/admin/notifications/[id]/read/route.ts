// @ts-nocheck
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  try {
    const { id } = await params;
    const admin = getAdminClient();

    const { error } = await admin
      .from("notifications")
      .update({ is_read: true } as never)
      .eq("id", id);

    if (error) {
      return err("Failed to update notification", "INTERNAL_ERROR", 500);
    }

    return ok({ updated: true });
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
