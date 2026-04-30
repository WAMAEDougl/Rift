import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.enum(["ordering", "shipping", "products", "health", "restaurant", "wholesale", "general"]),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("faqs")
    .select("*")
    .order("category")
    .order("sort_order");

  if (error) return err("Failed to fetch FAQs", "INTERNAL_ERROR", 500);
  return ok(data ?? []);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin.from("faqs").insert(parsed.data as never).select().single();
  if (error || !data) return err("Failed to create FAQ", "INTERNAL_ERROR", 500);
  return ok(data, 201);
}

