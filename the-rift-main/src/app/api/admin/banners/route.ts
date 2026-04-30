import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const bannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image_url: z.string().min(1),
  mobile_image_url: z.string().optional().nullable(),
  link_url: z.string().optional().nullable(),
  link_text: z.string().optional().nullable(),
  position: z.enum(["hero", "promo_strip", "middle", "footer"]),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  title_color: z.string().optional().nullable(),
  subtitle_color: z.string().optional().nullable(),
  description_color: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const position = url.searchParams.get("position") as "hero" | "promo_strip" | "middle" | "footer" | null;

  const admin = getAdminClient();
  let query = admin.from("banners").select("*").order("sort_order", { ascending: true });
  if (position) query = query.eq("position", position);

  const { data, error } = await query;
  if (error) return err("Failed to fetch banners", "INTERNAL_ERROR", 500);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("banners")
    .insert(parsed.data as Record<string, unknown>)
    .select()
    .single();

  if (error || !data) return err("Failed to create banner", "INTERNAL_ERROR", 500);
  return ok(data, 201);
}
