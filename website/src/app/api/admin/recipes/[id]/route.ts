import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { recipePatchSchema } from "../schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const { data: recipe, error } = await admin
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !recipe) {
    return err("Recipe not found", "NOT_FOUND", 404);
  }

  return ok(recipe);
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

  const parsed = recipePatchSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const admin = getAdminClient();

  // Check slug uniqueness excluding the current recipe
  if (parsed.data.slug !== undefined) {
    const { data: existing } = await admin
      .from("recipes")
      .select("id")
      .eq("slug", parsed.data.slug)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return err("A recipe with this slug already exists", "CONFLICT", 409);
    }
  }

  const { data: recipe, error } = await admin
    .from("recipes")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !recipe) {
    return err("Recipe not found", "NOT_FOUND", 404);
  }

  return ok(recipe);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const { error } = await admin
    .from("recipes")
    .delete()
    .eq("id", id);

  if (error) {
    return err("Failed to delete recipe", "INTERNAL_ERROR", 500);
  }

  return ok({ deleted: true });
}
