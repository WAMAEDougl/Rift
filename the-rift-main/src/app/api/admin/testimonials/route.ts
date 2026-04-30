// @ts-nocheck
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const schema = z.object({
  name: z.string().min(1),
  role: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  quote: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  product: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return err("Failed to fetch testimonials", "INTERNAL_ERROR", 500);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin.from("testimonials").insert(parsed.data as never).select().single();
  if (error || !data) return err("Failed to create testimonial", "INTERNAL_ERROR", 500);
  return ok(data, 201);
}

