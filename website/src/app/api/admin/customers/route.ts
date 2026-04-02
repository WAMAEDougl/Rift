import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const { page, per_page, offset } = parsePagination(url.searchParams);
  const q = url.searchParams.get("q");
  const role = url.searchParams.get("role");

  const admin = getAdminClient();

  // Count query
  let countQuery = admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (q) {
    countQuery = countQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (role) {
    countQuery = countQuery.eq("role", role);
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    return err("Failed to count customers", "INTERNAL_ERROR", 500);
  }

  // Items query — fetch profiles with their orders for aggregation
  let itemsQuery = admin
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at, orders(total, payment_status)")
    .order("created_at", { ascending: false })
    .range(offset, offset + per_page - 1);

  if (q) {
    itemsQuery = itemsQuery.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }
  if (role) {
    itemsQuery = itemsQuery.eq("role", role);
  }

  const { data, error } = await itemsQuery;
  if (error) {
    return err("Failed to fetch customers", "INTERNAL_ERROR", 500);
  }

  const items = (data ?? []).map((profile: Record<string, unknown>) => {
    const orders = (profile.orders as Array<{ total: number; payment_status: string }>) ?? [];
    const { orders: _orders, ...rest } = profile;
    return {
      ...rest,
      order_count: orders.length,
      total_spent: orders
        .filter((o) => o.payment_status === "completed")
        .reduce((sum, o) => sum + o.total, 0),
    };
  });

  return ok(paginatedResponse(items, count ?? 0, page, per_page));
}
