import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { productSchema, productPatchSchema } from "../schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !product) {
    return err("Product not found", "NOT_FOUND", 404);
  }

  return ok(product);
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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const admin = getAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .update(parsed.data as never)
    .eq("id", id)
    .select()
    .single();

  if (error || !product) {
    return err("Product not found", "NOT_FOUND", 404);
  }

  return ok(product);
}

export async function PATCH(
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

  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const admin = getAdminClient();

  const { data: product, error } = await admin
    .from("products")
    .update(parsed.data as never)
    .eq("id", id)
    .select()
    .single();

  if (error || !product) {
    return err("Product not found", "NOT_FOUND", 404);
  }

  return ok(product);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  // Check if product has order_items
  const { count, error: countError } = await admin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if (countError) {
    return err("Failed to check order history", "INTERNAL_ERROR", 500);
  }

  if ((count ?? 0) > 0) {
    // Soft-delete: deactivate the product
    const { error: updateError } = await admin
      .from("products")
      .update({ is_active: false } as never)
      .eq("id", id);

    if (updateError) {
      return err("Failed to deactivate product", "INTERNAL_ERROR", 500);
    }

    return ok({ soft_deleted: true, reason: "Product has order history. Deactivated instead." });
  }

  // Hard-delete
  const { error: deleteError } = await admin
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return err("Failed to delete product", "INTERNAL_ERROR", 500);
  }

  return ok({ deleted: true });
}
