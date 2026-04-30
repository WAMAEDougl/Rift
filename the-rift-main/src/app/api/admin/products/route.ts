import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";
import { ok, err } from "@/lib/admin/response";
import { productSchema } from "./schema";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const { page, per_page, offset } = parsePagination(url.searchParams);

  const q = url.searchParams.get("q");
  const category_id = url.searchParams.get("category_id");
  const in_stock = url.searchParams.get("in_stock");
  const is_active = url.searchParams.get("is_active");

  const admin = getAdminClient();

  // Count query
  let countQuery = admin
    .from("products")
    .select("*", { count: "exact", head: true });

  if (q) countQuery = countQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  if (category_id) countQuery = countQuery.eq("category_id", category_id);
  if (in_stock !== null) countQuery = countQuery.eq("in_stock", in_stock === "true");
  if (is_active !== null) countQuery = countQuery.eq("is_active", is_active === "true");

  // Items query
  let itemsQuery = admin
    .from("products")
    .select("*, categories(name)");

  if (q) itemsQuery = itemsQuery.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  if (category_id) itemsQuery = itemsQuery.eq("category_id", category_id);
  if (in_stock !== null) itemsQuery = itemsQuery.eq("in_stock", in_stock === "true");
  if (is_active !== null) itemsQuery = itemsQuery.eq("is_active", is_active === "true");

  itemsQuery = itemsQuery
    .range(offset, offset + per_page - 1)
    .order("sort_order", { ascending: true });

  const [countResult, itemsResult] = await Promise.all([countQuery, itemsQuery]);

  if (countResult.error) {
    return err("Failed to fetch products", "INTERNAL_ERROR", 500);
  }
  if (itemsResult.error) {
    return err("Failed to fetch products", "INTERNAL_ERROR", 500);
  }

  const total = countResult.count ?? 0;
  const items = (itemsResult.data ?? []).map((product: Record<string, unknown>) => {
    const categories = product.categories as { name: string } | null;
    return {
      ...product,
      categories: undefined,
      category_name: categories?.name ?? null,
    };
  });

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

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const data = parsed.data;
  const admin = getAdminClient();

  // Check slug conflict
  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("slug", data.slug)
    .single();

  if (existing) {
    return err("A product with this slug already exists", "CONFLICT", 409);
  }

  const { data: product, error: insertError } = await admin
    .from("products")
    .insert(data as Record<string, unknown>)
    .select()
    .single();

  if (insertError || !product) {
    return err("Failed to create product", "INTERNAL_ERROR", 500);
  }

  return ok(product, 201);
}
