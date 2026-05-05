import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const heroConfigSchema = z.object({
  hero_bg_image_url:     z.string().optional().nullable(),
  hero_eyebrow:          z.string().optional().nullable(),
  hero_headline:         z.string().optional().nullable(),
  hero_headline_accent:  z.string().optional().nullable(),
  hero_description:      z.string().optional().nullable(),
  hero_cta_text:         z.string().optional().nullable(),
  hero_cta_url:          z.string().optional().nullable(),
  hero_cta2_text:        z.string().optional().nullable(),
  hero_cta2_url:         z.string().optional().nullable(),
  hero_stat1_value:      z.string().optional().nullable(),
  hero_stat1_label:      z.string().optional().nullable(),
  hero_stat1_sub:        z.string().optional().nullable(),
  hero_stat2_value:      z.string().optional().nullable(),
  hero_stat2_label:      z.string().optional().nullable(),
  hero_stat2_sub:        z.string().optional().nullable(),
  hero_stat3_value:      z.string().optional().nullable(),
  hero_stat3_label:      z.string().optional().nullable(),
  hero_stat3_sub:        z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const parsed = heroConfigSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from("store_settings")
    .update(parsed.data as never)
    .eq("id", 1);

  if (error) return err("Failed to save hero config", "INTERNAL_ERROR", 500);
  return ok({ saved: true });
}
