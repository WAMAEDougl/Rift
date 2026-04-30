// @ts-nocheck
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { createNotification } from "@/lib/admin/notifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;

  // Parse optional body
  let reason: string | undefined;
  try {
    const body = await request.json();
    if (body && typeof body.reason === "string") {
      reason = body.reason;
    }
  } catch {
    // body is optional — ignore parse errors
  }

  const admin = getAdminClient();

  // Fetch current order
  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("id, order_number, status, payment_status, order_notes")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  // Build update object
  type OrderUpdate = {
    status: string;
    order_notes?: string;
    payment_status?: string;
  };
  const updateObj: OrderUpdate = { status: "cancelled" };

  if (reason) {
    updateObj.order_notes = [order.order_notes, reason]
      .filter(Boolean)
      .join("\n");
  }

  if (order.payment_status === "completed") {
    updateObj.payment_status = "refunded";
  }

  const { data: updatedOrder, error: updateError } = await admin
    .from("orders")
    .update(updateObj as never)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updatedOrder) {
    return err("Failed to cancel order", "INTERNAL_ERROR", 500);
  }

  // Fire-and-forget notification
  createNotification(
    "order_cancelled",
    `Order #${order.order_number} Cancelled`,
    reason ?? "Order cancelled by admin",
    id
  );

  return ok(updatedOrder);
}
