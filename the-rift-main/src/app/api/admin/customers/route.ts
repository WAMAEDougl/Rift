// @ts-nocheck
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";

export async function GET(request: Request) {
  console.log("[customers] start");
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const { page, per_page, offset } = parsePagination(url.searchParams);
  const q = url.searchParams.get("q");
  const role = url.searchParams.get("role");

  const admin = getAdminClient();
  console.log("[customers] admin client created, url:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Step 1: Fetch all orders with customer info
  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id, customer_name, customer_phone, customer_email, delivery_address, delivery_city, total, payment_status, created_at, status");

  console.log("[customers] orders:", orders?.length, "error:", ordersError?.message ?? "none");
  if (ordersError) {
    return err(`Failed to fetch orders: ${ordersError.message}`, "INTERNAL_ERROR", 500);
  }

  // Step 2: Fetch all profiles for role lookups (by phone matching)
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, role, default_city, created_at");

  const profilesByPhone = new Map<string, Record<string, unknown>>();
  if (profiles) {
    for (const p of profiles) {
      if (p.phone) profilesByPhone.set(p.phone, p);
    }
  }

  // Step 3: Aggregate customers by phone number
  const customerMap = new Map<string, any>();

  for (const order of orders) {
    const phone = order.customer_phone;
    if (!phone) continue;

    if (!customerMap.has(phone)) {
      const profile = profilesByPhone.get(phone);
      customerMap.set(phone, {
        id: profile?.id ?? `cust-${phone}`,
        full_name: profile?.full_name ?? order.customer_name,
        email: profile?.email ?? order.customer_email ?? null,
        phone,
        role: profile?.role ?? "customer",
        default_city: profile?.default_city ?? order.delivery_city ?? null,
        created_at: profile?.created_at ?? order.created_at,
        order_count: 0,
        total_spent: 0,
        last_order_at: order.created_at,
        last_delivery_address: order.delivery_address,
      });
    }

    const customer = customerMap.get(phone);
    customer.order_count++;
    if (order.payment_status === "completed") {
      customer.total_spent += order.total;
    }
    // Keep most recent order date
    if (new Date(order.created_at) > new Date(customer.last_order_at)) {
      customer.last_order_at = order.created_at;
      customer.last_delivery_address = order.delivery_address;
    }
  }

  // Convert to array
  let customers = Array.from(customerMap.values());

  // Filter by search
  if (q) {
    const ql = q.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(ql) ||
        c.email?.toLowerCase().includes(ql) ||
        c.phone?.toLowerCase().includes(ql)
    );
  }

  // Filter by role
  if (role) {
    customers = customers.filter((c) => c.role === role);
  }

  // Sort by most recent order
  customers.sort((a, b) => new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime());

  const total = customers.length;
  const paginated = customers.slice(offset, offset + per_page);

  return ok(paginatedResponse(paginated, total, page, per_page));
}

