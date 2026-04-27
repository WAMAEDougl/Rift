import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const { page, per_page, offset } = parsePagination(url.searchParams);

  const q = url.searchParams.get("q");
  const payment_method = url.searchParams.get("payment_method");
  const payment_status = url.searchParams.get("payment_status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const admin = getAdminClient();

  // Build count query
  let countQuery = admin
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (q) countQuery = countQuery.or(`order_number.ilike.%${q}%,mpesa_receipt_number.ilike.%${q}%`);
  if (payment_method) countQuery = countQuery.eq("payment_method", payment_method);
  if (payment_status) countQuery = countQuery.eq("payment_status", payment_status);
  if (from) countQuery = countQuery.gte("created_at", from);
  if (to) countQuery = countQuery.lte("created_at", to);

  // Build items query
  let itemsQuery = admin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, total, payment_method, payment_status, mpesa_receipt_number, created_at"
    );

  if (q) itemsQuery = itemsQuery.or(`order_number.ilike.%${q}%,mpesa_receipt_number.ilike.%${q}%`);
  if (payment_method) itemsQuery = itemsQuery.eq("payment_method", payment_method);
  if (payment_status) itemsQuery = itemsQuery.eq("payment_status", payment_status);
  if (from) itemsQuery = itemsQuery.gte("created_at", from);
  if (to) itemsQuery = itemsQuery.lte("created_at", to);

  itemsQuery = itemsQuery
    .range(offset, offset + per_page - 1)
    .order("created_at", { ascending: false });

  const [countResult, itemsResult] = await Promise.all([countQuery, itemsQuery]);

  if (countResult.error) {
    return err("Failed to fetch payments", "INTERNAL_ERROR", 500);
  }
  if (itemsResult.error) {
    return err("Failed to fetch payments", "INTERNAL_ERROR", 500);
  }

  const total = countResult.count ?? 0;
  return ok(paginatedResponse(itemsResult.data ?? [], total, page, per_page));
}
