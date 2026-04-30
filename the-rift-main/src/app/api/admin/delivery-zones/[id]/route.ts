import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const zonePatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  areas: z.array(z.string()).optional(),
  fee: z.number().int().min(0).optional(),
  free_above: z.number().int().min(0).optional().nullable(),
  estimated_days: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const parsed = zonePatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("delivery_zones")
    .update(parsed.data as never)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return err("Delivery zone not found", "NOT_FOUND", 404);
  return ok(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();
  const { error } = await admin.from("delivery_zones").delete().eq("id", id);
  if (error) return err("Failed to delete delivery zone", "INTERNAL_ERROR", 500);
  return ok({ deleted: true });
}
