import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;

  if (id === session.user.id) {
    return err("You cannot demote yourself.", "VALIDATION_ERROR", 400);
  }

  try {
    const admin = getAdminClient();
    const { data: updatedProfile, error } = await admin
      .from("profiles")
      .update({ role: "customer" } as Record<string, unknown>)
      .eq("id", id)
      .select()
      .single();

    if (error || !updatedProfile) {
      return err("User not found", "NOT_FOUND", 404);
    }

    return ok({ id, role: "customer" });
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
