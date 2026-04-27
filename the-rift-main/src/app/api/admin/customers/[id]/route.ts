import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const isCustId = id.startsWith("cust-");

  if (isCustId) {
    // Order-based customer: ID is "cust-{phone}"
    const phone = id.replace("cust-", "");

    // Fetch orders by phone
    const { data: orders, error: ordersError } = await admin
      .from("orders")
      .select("id, order_number, status, payment_status, customer_name, customer_phone, customer_email, delivery_address, delivery_city, total, created_at")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false })
      .limit(200);

    if (ordersError) {
      return err("Failed to fetch orders", "INTERNAL_ERROR", 500);
    }

    const orderList = orders ?? [];
    if (orderList.length === 0) {
      return err("Customer not found", "NOT_FOUND", 404);
    }

    // Try to find a matching profile
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, email, phone, role, default_city, created_at")
      .eq("phone", phone)
      .single();

    const customer = profile ? {
      id,
      full_name: profile.full_name ?? orderList[0]?.customer_name ?? "—",
      email: profile.email ?? orderList[0]?.customer_email ?? null,
      phone: profile.phone ?? phone,
      role: profile.role ?? "customer",
      default_city: profile.default_city ?? orderList[0]?.delivery_city ?? null,
      created_at: profile.created_at ?? orderList[0]?.created_at,
    } : {
      id,
      full_name: orderList[0]?.customer_name ?? "—",
      email: orderList[0]?.customer_email ?? null,
      phone,
      role: "customer" as const,
      default_city: orderList[0]?.delivery_city ?? null,
      created_at: orderList[0]?.created_at,
    };

    const stats = {
      order_count: orderList.length,
      total_spent_kes: orderList
        .filter((o) => o.payment_status === "completed")
        .reduce((sum: number, o) => sum + o.total, 0),
      first_order_at: orderList[orderList.length - 1]?.created_at ?? null,
      last_order_at: orderList[0]?.created_at ?? null,
    };

    return ok({ profile: customer, orders: orderList, stats });
  }

  // UUID: lookup by profile ID
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, full_name, email, phone, role, default_city, created_at")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    return err("Customer not found", "NOT_FOUND", 404);
  }

  // Fetch orders — try by customer_id first, then by phone fallback
  let { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id, order_number, status, payment_status, customer_name, customer_phone, customer_email, delivery_address, delivery_city, total, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  // If no orders by ID, try by phone
  if (!orders || orders.length === 0) {
    const { data: phoneOrders } = await admin
      .from("orders")
      .select("id, order_number, status, payment_status, customer_name, customer_phone, customer_email, delivery_address, delivery_city, total, created_at")
      .eq("customer_phone", profile.phone ?? "")
      .order("created_at", { ascending: false })
      .limit(200);

    if (phoneOrders) orders = phoneOrders;
  }

  if (ordersError) {
    return err("Failed to fetch customer orders", "INTERNAL_ERROR", 500);
  }

  const orderList = orders ?? [];

  const stats = {
    order_count: orderList.length,
    total_spent_kes: orderList
      .filter((o) => o.payment_status === "completed")
      .reduce((sum: number, o) => sum + o.total, 0),
    first_order_at: orderList.length
      ? orderList[orderList.length - 1].created_at
      : null,
    last_order_at: orderList.length ? orderList[0].created_at : null,
  };

  return ok({ profile, orders: orderList, stats });
}
