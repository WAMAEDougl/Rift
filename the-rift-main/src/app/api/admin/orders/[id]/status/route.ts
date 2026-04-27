import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { isValidStatusTransition } from "@/lib/admin/status";
import { OrderStatus } from "@/lib/admin/types";
import { z } from "zod";

const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "dispatched",
    "delivered",
    "cancelled",
  ]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;

  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 422);
  }

  const { status: newStatus } = parsed.data;

  // Kitchen role cannot cancel
  if (newStatus === "cancelled" && session.profile.role === "kitchen") {
    return err("Forbidden", "FORBIDDEN", 403);
  }

  const admin = getAdminClient();

  // Fetch current order
  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  // Validate transition
  if (!isValidStatusTransition(order.status as OrderStatus, newStatus)) {
    return err(
      `Order is already ${order.status} and cannot be updated.`,
      "CONFLICT",
      409
    );
  }

  // Build update object
  type OrderUpdate = {
    status: string;
    completed_at?: string;
    confirmed_at?: string;
  };
  const updateObj: OrderUpdate = { status: newStatus };
  if (newStatus === "delivered") {
    updateObj.completed_at = new Date().toISOString();
  }
  if (newStatus === "confirmed") {
    updateObj.confirmed_at = new Date().toISOString();
  }

  const { data: updatedOrder, error: updateError } = await admin
    .from("orders")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateObj as any)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updatedOrder) {
    return err("Failed to update order", "INTERNAL_ERROR", 500);
  }

  return ok(updatedOrder);
}
