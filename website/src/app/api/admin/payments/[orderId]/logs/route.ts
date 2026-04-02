import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { orderId } = await params;
  const admin = getAdminClient();

  // Check if order exists
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  // Fetch payment logs
  const { data: logs, error: logsError } = await admin
    .from("payment_logs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (logsError) {
    return err("Failed to fetch payment logs", "INTERNAL_ERROR", 500);
  }

  return ok(logs ?? []);
}
