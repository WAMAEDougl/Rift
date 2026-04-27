import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const admin = getAdminClient();

  const [ordersResult, revenueResult, pendingResult, customersResult] =
    await Promise.all([
      // 1. Count all orders
      admin.from("orders").select("*", { count: "exact", head: true }),
      // 2. Sum revenue from completed orders
      admin.from("orders").select("total").eq("payment_status", "completed"),
      // 3. Count pending/confirmed orders
      admin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"]),
      // 4. Count customers
      admin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "customer"),
    ]);

  if (ordersResult.error || revenueResult.error || pendingResult.error || customersResult.error) {
    return err("Failed to fetch dashboard stats", "INTERNAL_ERROR", 500);
  }

  const total_revenue_kes = (revenueResult.data ?? []).reduce(
    (sum, row) => sum + (row.total ?? 0),
    0
  );

  return ok({
    total_orders: ordersResult.count ?? 0,
    total_revenue_kes,
    pending_orders: pendingResult.count ?? 0,
    total_customers: customersResult.count ?? 0,
  });
}
