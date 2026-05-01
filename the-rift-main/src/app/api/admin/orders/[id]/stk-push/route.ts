import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { initiateSTKPush, isMpesaConfigured, normalizePhone } from "@/lib/mpesa";

const bodySchema = z.object({
  delivery_fee: z.number().int().min(0),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "delivery_fee must be a non-negative integer", "VALIDATION_ERROR", 422);
  }

  const { delivery_fee } = parsed.data;

  if (!isMpesaConfigured()) {
    return err("M-Pesa is not configured on this server", "SERVICE_UNAVAILABLE", 503);
  }

  const admin = getAdminClient();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, order_number, subtotal, customer_phone, payment_status")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  const amount = order.subtotal + delivery_fee;

  if (!Number.isInteger(amount) || amount <= 0) {
    return err("Computed charge amount must be a positive integer", "VALIDATION_ERROR", 422);
  }

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

  // Update order with delivery fee and new total
  await admin
    .from("orders")
    .update({ delivery_fee, total: amount } as never)
    .eq("id", id);

  // Log the STK Push event
  await admin.from("payment_logs").insert({
    order_id: id,
    provider: "mpesa",
    event_type: "admin_stk_push_initiated",
    raw_payload: stkResponse as unknown as Record<string, unknown>,
  });

  return ok({
    checkout_request_id: stkResponse.CheckoutRequestID,
    message: "STK Push sent",
    amount,
  });
}
