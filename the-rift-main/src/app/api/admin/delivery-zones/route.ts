import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const zoneSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  areas: z.array(z.string()).default([]),
  fee: z.number().int().min(0),
  free_above: z.number().int().min(0).optional().nullable(),
  estimated_days: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("delivery_zones")
    .select("*")
    .order("name", { ascending: true });

  if (error) return err("Failed to fetch delivery zones", "INTERNAL_ERROR", 500);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const parsed = zoneSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("delivery_zones")
    .insert(parsed.data as Record<string, unknown>)
    .select()
    .single();

  if (error || !data) return err("Failed to create delivery zone", "INTERNAL_ERROR", 500);
  return ok(data, 201);
}
