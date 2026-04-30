import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const roleSchema = z.object({
  role: z.enum(["customer", "kitchen", "admin"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;

  // Guard: cannot change own role
  if (id === session.user.id) {
    return err("You cannot change your own role.", "FORBIDDEN", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const { role } = parsed.data;
  const admin = getAdminClient();

  const { data: updatedProfile, error } = await admin
    .from("profiles")
    .update({ role } as Record<string, unknown>)
    .eq("id", id)
    .select()
    .single();

  if (error || !updatedProfile) {
    return err("Customer not found", "NOT_FOUND", 404);
  }

  return ok(updatedProfile);
}
