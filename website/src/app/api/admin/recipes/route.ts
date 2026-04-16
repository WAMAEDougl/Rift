import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";
import { ok, err } from "@/lib/admin/response";
import { recipeSchema } from "./schema";
import type { Database } from "@/lib/supabase/types";

type RecipeCategory = Database["public"]["Tables"]["recipes"]["Row"]["category"];
type RecipeDifficulty = Database["public"]["Tables"]["recipes"]["Row"]["difficulty"];

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const { page, per_page, offset } = parsePagination(url.searchParams);

  const q = url.searchParams.get("q");
  const category = url.searchParams.get("category");
  const difficulty = url.searchParams.get("difficulty");

  const admin = getAdminClient();

  // Count query
  let countQuery = admin
    .from("recipes")
    .select("*", { count: "exact", head: true });

  if (q) countQuery = countQuery.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  if (category) countQuery = countQuery.eq("category", category as RecipeCategory);
  if (difficulty) countQuery = countQuery.eq("difficulty", difficulty as RecipeDifficulty);

  // Items query
  let itemsQuery = admin.from("recipes").select("*");

  if (q) itemsQuery = itemsQuery.or(`title.ilike.%${q}%,slug.ilike.%${q}%`);
  if (category) itemsQuery = itemsQuery.eq("category", category as RecipeCategory);
  if (difficulty) itemsQuery = itemsQuery.eq("difficulty", difficulty as RecipeDifficulty);

  itemsQuery = itemsQuery
    .range(offset, offset + per_page - 1)
    .order("created_at", { ascending: false });

  const [countResult, itemsResult] = await Promise.all([countQuery, itemsQuery]);

  if (countResult.error) {
    return err("Failed to fetch recipes", "INTERNAL_ERROR", 500);
  }
  if (itemsResult.error) {
    return err("Failed to fetch recipes", "INTERNAL_ERROR", 500);
  }

  const total = countResult.count ?? 0;
  const items = itemsResult.data ?? [];

  return ok(paginatedResponse(items, total, page, per_page));
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

  const parsed = recipeSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const data = parsed.data;
  const admin = getAdminClient();

  // Check slug uniqueness
  const { data: existing } = await admin
    .from("recipes")
    .select("id")
    .eq("slug", data.slug)
    .single();

  if (existing) {
    return err("A recipe with this slug already exists", "CONFLICT", 409);
  }

  const { data: recipe, error: insertError } = await admin
    .from("recipes")
    .insert(data)
    .select()
    .single();

  if (insertError || !recipe) {
    return err("Failed to create recipe", "INTERNAL_ERROR", 500);
  }

  return ok(recipe, 201);
}
