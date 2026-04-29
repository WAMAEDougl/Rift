import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const bannerPatchSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().min(1).optional(),
  mobile_image_url: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  link_text: z.string().optional().nullable(),
  position: z.enum(["hero", "promo_strip", "middle", "footer"]).optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
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

  const parsed = bannerPatchSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("banners")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return err("Banner not found", "NOT_FOUND", 404);
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
  const { error } = await admin.from("banners").delete().eq("id", id);
  if (error) return err("Failed to delete banner", "INTERNAL_ERROR", 500);
  return ok({ deleted: true });
}
