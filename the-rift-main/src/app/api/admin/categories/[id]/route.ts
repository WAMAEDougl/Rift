// @ts-nocheck
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const { data: category, error } = await admin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !category) {
    return err("Category not found", "NOT_FOUND", 404);
  }

  return ok(category);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;

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

  const admin = getAdminClient();

  const { data: category, error } = await admin
    .from("categories")
    .update(parsed.data as never)
    .eq("id", id)
    .select()
    .single();

  if (error || !category) {
    return err("Category not found", "NOT_FOUND", 404);
  }

  return ok(category);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  // Check if category has products
  const { count, error: countError } = await admin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) {
    return err("Failed to check category products", "INTERNAL_ERROR", 500);
  }

  if ((count ?? 0) > 0) {
    return err(
      "Category has products. Reassign or delete them first.",
      "CONFLICT",
      409
    );
  }

  // Hard-delete
  const { error: deleteError } = await admin
    .from("categories")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return err("Failed to delete category", "INTERNAL_ERROR", 500);
  }

  return ok({ deleted: true });
}
