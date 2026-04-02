import { z } from "zod";
import { isMpesaConfigured, initiateSTKPush } from "@/lib/mpesa";
import { normalizePhone } from "@/lib/utils/validation";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const initiateSchema = z.object({
  order_id: z.string().uuid(),
  phone: z.string().regex(/^(07\d{8}|\+2547\d{8}|2547\d{8})$/),
});

export async function POST(request: Request) {
  try {
    // Parse and validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return err("Invalid JSON body", "VALIDATION_ERROR", 422);
    }

    const parsed = initiateSchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 422);
    }

    const { order_id, phone } = parsed.data;

    // Check M-Pesa is configured
    if (!isMpesaConfigured()) {
      return err("M-Pesa is not configured on this server.", "SERVICE_UNAVAILABLE", 503);
    }

    // Normalize phone
    const normalizedPhone = normalizePhone(phone);

    const supabase = getAdminClient();

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status")
      .eq("id", order_id)
      .single();

    if (orderError || !order || order.payment_status !== "pending") {
      return err("Order not found or not eligible for payment", "VALIDATION_ERROR", 422);
    }

    // Initiate STK Push
    let stkResponse;
    try {
      stkResponse = await initiateSTKPush(normalizedPhone, order.total, order.order_number);
    } catch {
      return err("Failed to initiate M-Pesa payment", "INTERNAL_ERROR", 500);
    }

    if (!stkResponse?.CheckoutRequestID) {
      return err("Failed to initiate M-Pesa payment", "INTERNAL_ERROR", 500);
    }

    // Update order
    await supabase
      .from("orders")
      .update({
        mpesa_checkout_request_id: stkResponse.CheckoutRequestID,
        payment_status: "processing",
      })
      .eq("id", order_id);

    // Insert payment log
    await supabase.from("payment_logs").insert({
      order_id,
      provider: "mpesa",
      event_type: "stk_push_initiated",
      raw_payload: stkResponse,
    });

    return ok({
      checkout_request_id: stkResponse.CheckoutRequestID,
      message: "STK Push sent to your phone",
    });
  } catch (e) {
    console.error("M-Pesa initiate error:", e);
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
