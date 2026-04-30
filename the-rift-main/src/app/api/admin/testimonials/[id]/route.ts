// @ts-nocheck
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const schema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  quote: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  product: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
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
  const { data, error } = await admin.from("testimonials").update(parsed.data as never).eq("id", id).select().single();
  if (error || !data) return err("Testimonial not found", "NOT_FOUND", 404);
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
  const { error } = await admin.from("testimonials").delete().eq("id", id);
  if (error) return err("Failed to delete testimonial", "INTERNAL_ERROR", 500);
  return ok({ deleted: true });
}
