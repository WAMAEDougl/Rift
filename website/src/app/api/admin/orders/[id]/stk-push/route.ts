import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { initiateSTKPush, isMpesaConfigured } from "@/lib/mpesa";
import { normalizePhone } from "@/lib/utils/validation";
import { z } from "zod";

const bodySchema = z.object({
  delivery_fee: z.number().int().min(0),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Require admin session (admin role only)
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  // 2. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 422);
  }

  const { delivery_fee } = parsed.data;

  // 3. Fetch order by id
  const { id } = await params;
  const admin = getAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("id, order_number, subtotal, customer_phone, customer_name, payment_status, status")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  // 3.5 Guard: order must be awaiting delivery confirmation
  if (order.status !== "pending_delivery_confirmation") {
    return err("Order is not awaiting delivery confirmation", "ORDER_NOT_READY", 409);
  }

  // 4. Check M-Pesa configuration
  if (!isMpesaConfigured()) {
    return err("M-Pesa is not configured", "SERVICE_UNAVAILABLE", 503);
  }

  // 5. Compute amount and validate
  const amount = order.subtotal + delivery_fee;
  if (amount <= 0) {
    return err("Order amount must be greater than zero", "VALIDATION_ERROR", 422);
  }

  // 6. Transition order status to "pending" before initiating STK Push
  await admin
    .from("orders")
    .update({ status: "pending" })
    .eq("id", order.id);

  // 7. Initiate STK Push
  let stkResponse;
  try {
    stkResponse = await initiateSTKPush(
      normalizePhone(order.customer_phone),
      amount,
      order.order_number
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "STK Push failed";
    return err(message, "INTERNAL_ERROR", 500);
  }

  // 7a. Update order with delivery_fee, total, and checkout_request_id
  await admin
    .from("orders")
    .update({
      delivery_fee,
      total: amount,
      mpesa_checkout_request_id: stkResponse.CheckoutRequestID,
    })
    .eq("id", order.id);

  // 8. Insert payment log
  await admin.from("payment_logs").insert({
    order_id: order.id,
    event_type: "admin_stk_push_initiated",
    raw_payload: stkResponse,
  });

  // 9. Insert audit log entry
  await admin.from("order_audit_logs").insert({
    order_id: order.id,
    event_type: "delivery_fee_authorized",
    delivery_fee,
    authorized_by_id: session.user.id,
    authorized_by_name: session.profile.full_name ?? "Admin",
  });

  // 10. Return success — receipt is sent automatically by the M-Pesa callback on payment
  return ok({
    checkout_request_id: stkResponse.CheckoutRequestID,
    message: "STK Push sent",
  });
}
