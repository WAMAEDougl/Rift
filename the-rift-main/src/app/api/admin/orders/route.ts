import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const isExport = url.searchParams.get("export") === "true";
  const { page, per_page, offset } = parsePagination(url.searchParams);

  const status = url.searchParams.get("status");
  const payment_status = url.searchParams.get("payment_status");
  const delivery_type = url.searchParams.get("delivery_type");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const q = url.searchParams.get("q");

  const admin = getAdminClient();

  // Build count query
  let countQuery = admin
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (status) countQuery = countQuery.eq("status", status);
  if (payment_status) countQuery = countQuery.eq("payment_status", payment_status);
  if (delivery_type) countQuery = countQuery.eq("delivery_type", delivery_type);
  if (from) countQuery = countQuery.gte("created_at", from);
  if (to) countQuery = countQuery.lte("created_at", to);
  if (q) countQuery = countQuery.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);

  // Build items query
  let itemsQuery = admin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, delivery_address, delivery_city, subtotal, delivery_fee, total, delivery_type, status, payment_method, payment_status, created_at, order_items(count)"
    );

  if (status) itemsQuery = itemsQuery.eq("status", status);
  if (payment_status) itemsQuery = itemsQuery.eq("payment_status", payment_status);
  if (delivery_type) itemsQuery = itemsQuery.eq("delivery_type", delivery_type);
  if (from) itemsQuery = itemsQuery.gte("created_at", from);
  if (to) itemsQuery = itemsQuery.lte("created_at", to);
  if (q) itemsQuery = itemsQuery.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);

  itemsQuery = itemsQuery
    .range(offset, offset + per_page - 1)
    .order("created_at", { ascending: false });

  const [countResult, itemsResult] = await Promise.all([countQuery, itemsQuery]);

  if (countResult.error) {
    return err("Failed to fetch orders", "INTERNAL_ERROR", 500);
  }
  if (itemsResult.error) {
    return err("Failed to fetch orders", "INTERNAL_ERROR", 500);
  }

  const total = countResult.count ?? 0;
  const items = (itemsResult.data ?? []).map((order: Record<string, unknown>) => {
    const orderItems = order.order_items as Array<{ count: number }> | null;
    return {
      ...order,
      order_items: undefined,
      item_count: orderItems?.[0]?.count ?? 0,
    };
  });

  if (isExport) {
    const exportData = items.map((order: Record<string, unknown>) => ({
      "Order Number": order.order_number,
      "Customer Name": order.customer_name,
      "Customer Phone": order.customer_phone,
      "Delivery Type": order.delivery_type,
      "Delivery Address": order.delivery_address,
      "Delivery City": order.delivery_city,
      Subtotal: order.subtotal,
      "Delivery Fee": order.delivery_fee,
      Total: order.total,
      "Payment Method": order.payment_method,
      "Payment Status": order.payment_status,
      Status: order.status,
      "Created At": order.created_at,
    }));

    return new Response(JSON.stringify(exportData), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  return ok(paginatedResponse(items, total, page, per_page));
}

