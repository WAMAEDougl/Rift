import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const schema = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  category: z.enum(["ordering", "shipping", "products", "health", "restaurant", "wholesale", "general"]).optional(),
  sort_order: z.number().int().optional(),
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin.from("faqs").update(parsed.data as Record<string, unknown>).eq("id", id).select().single();
  if (error || !data) return err("FAQ not found", "NOT_FOUND", 404);
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
  const { error } = await admin.from("faqs").delete().eq("id", id);
  if (error) return err("Failed to delete FAQ", "INTERNAL_ERROR", 500);
  return ok({ deleted: true });
}
