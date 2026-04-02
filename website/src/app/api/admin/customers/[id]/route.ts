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

  // Fetch profile
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError || !profile) {
    return err("Customer not found", "NOT_FOUND", 404);
  }

  // Fetch orders (max 200)
  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (ordersError) {
    return err("Failed to fetch customer orders", "INTERNAL_ERROR", 500);
  }

  const orderList = orders ?? [];

  const stats = {
    order_count: orderList.length,
    total_spent_kes: orderList
      .filter((o: Record<string, unknown>) => o.payment_status === "completed")
      .reduce((sum: number, o: Record<string, unknown>) => sum + (o.total as number), 0),
    first_order_at: orderList.length
      ? orderList[orderList.length - 1].created_at
      : null,
    last_order_at: orderList.length ? orderList[0].created_at : null,
  };

  return ok({ profile, orders: orderList, stats });
}
