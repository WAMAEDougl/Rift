import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/utils/api";
import type { STKCallbackData } from "@/lib/mpesa";
import { createNotification } from "@/lib/admin/notifications";
import { sendMessage, formatPaymentConfirmationMessage, formatDeliveryReceiptMessage } from "@/lib/wasender";

export async function POST(request: Request) {
  try {
    const data: STKCallbackData = await request.json();
    const callback = data.Body.stkCallback;
    const supabase = getServiceClient();

    // Log every callback
    await supabase.from("payment_logs").insert({
      provider: "mpesa",
      event_type: "callback_received",
      raw_payload: data,
    });

    // Find order
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("mpesa_checkout_request_id", callback.CheckoutRequestID)
      .single();

    if (!order) {
      console.error("Order not found for CheckoutRequestID:", callback.CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (callback.ResultCode === 0) {
      // Payment successful
      const metadata = callback.CallbackMetadata?.Item || [];
      const receiptNumber = metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

      await supabase
        .from("orders")
        .update({
          payment_status: "completed",
          mpesa_receipt_number: String(receiptNumber || ""),
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      await supabase.from("payment_logs").insert({
        order_id: order.id,
        provider: "mpesa",
        event_type: "payment_confirmed",
        raw_payload: { receipt: receiptNumber },
      });

      createNotification(
        "payment_completed",
        `Payment Received for #${order.order_number}`,
        `M-Pesa payment confirmed. Receipt: ${receiptNumber}`,
        order.id
      );

      // Fetch full order for WhatsApp confirmation message
      const { data: fullOrder } = await supabase
        .from("orders")
        .select("order_number, total, delivery_fee, customer_phone, mpesa_receipt_number")
        .eq("id", order.id)
        .single();

      if (fullOrder) {
        const message = fullOrder.delivery_fee > 0
          ? formatDeliveryReceiptMessage({
              order_number: fullOrder.order_number,
              mpesa_receipt_number: String(receiptNumber || ""),
              total: fullOrder.total,
              delivery_fee: fullOrder.delivery_fee,
            })
          : formatPaymentConfirmationMessage({
              order_number: fullOrder.order_number,
              mpesa_receipt_number: String(receiptNumber || ""),
              total: fullOrder.total,
            });

        sendMessage(fullOrder.customer_phone, message)
          .catch((e) => console.error("[Callback] WhatsApp send failed:", e));
      }
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);

      await supabase.from("payment_logs").insert({
        order_id: order.id,
        provider: "mpesa",
        event_type: "payment_failed",
        raw_payload: { result_code: callback.ResultCode, result_desc: callback.ResultDesc },
      });

      createNotification(
        "payment_failed",
        `Payment Failed for #${order.order_number}`,
        `M-Pesa payment failed. Code: ${callback.ResultCode} - ${callback.ResultDesc}`,
        order.id
      );
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error:", err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
