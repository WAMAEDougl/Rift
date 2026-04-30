import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const categorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  bg_color: z.string().optional(),
  ships_countrywide: z.boolean().default(false),
  price_from: z.number().int().optional(),
  sort_order: z.number().int().default(0),
});

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const admin = getAdminClient();

  const { data, error } = await admin
    .from("categories")
    .select("*, products(count)")
    .order("sort_order", { ascending: true });

  if (error) {
    return err("Failed to fetch categories", "INTERNAL_ERROR", 500);
  }

  const categories = (data ?? []).map((cat: Record<string, unknown>) => {
    const products = cat.products as Array<{ count: number }> | null;
    const { products: _products, ...rest } = cat;
    return {
      ...rest,
      product_count: products?.[0]?.count ?? 0,
    };
  });

  return ok(categories);
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const data = parsed.data;
  const admin = getAdminClient();

  // Check slug conflict
  const { data: existing } = await admin
    .from("categories")
    .select("id")
    .eq("slug", data.slug)
    .single();

  if (existing) {
    return err("A category with this slug already exists", "CONFLICT", 409);
  }

  const { data: category, error: insertError } = await admin
    .from("categories")
    .insert(data as Record<string, unknown>)
    .select()
    .single();

  if (insertError || !category) {
    return err("Failed to create category", "INTERNAL_ERROR", 500);
  }

  return ok(category, 201);
}
