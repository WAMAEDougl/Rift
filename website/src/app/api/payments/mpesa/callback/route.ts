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

      // Fetch full order including items for the WhatsApp receipt
      const { data: fullOrder } = await supabase
        .from("orders")
        .select("order_number, subtotal, total, delivery_fee, customer_phone, customer_name, delivery_address, delivery_city, mpesa_receipt_number, order_items(product_name, quantity, line_total)")
        .eq("id", order.id)
        .single();

      if (fullOrder) {
        // Use the receipt number saved to DB (guaranteed to be a string)
        const receipt = fullOrder.mpesa_receipt_number || String(receiptNumber || "");
        const message = fullOrder.delivery_fee > 0
          ? formatDeliveryReceiptMessage({
              order_number: fullOrder.order_number,
              mpesa_receipt_number: receipt,
              total: fullOrder.total,
              delivery_fee: fullOrder.delivery_fee,
              subtotal: fullOrder.subtotal,
              customer_name: fullOrder.customer_name,
              delivery_address: `${fullOrder.delivery_address}, ${fullOrder.delivery_city}`,
              items: fullOrder.order_items as Array<{ product_name: string; quantity: number; line_total: number }>,
            })
          : formatPaymentConfirmationMessage({
              order_number: fullOrder.order_number,
              mpesa_receipt_number: receipt,
              total: fullOrder.total,
              subtotal: fullOrder.subtotal,
              customer_name: fullOrder.customer_name,
              items: fullOrder.order_items as Array<{ product_name: string; quantity: number; line_total: number }>,
            });

        // Send receipt — retry once after 65s if rate-limited (free plan: 1 msg/min)
        const sendReceipt = async (attempt = 1) => {
          const result = await sendMessage(fullOrder.customer_phone, message);
          if (result.success) {
            console.log(`[Callback] WhatsApp receipt sent for order ${fullOrder.order_number}`);
          } else if (result.error.includes("429") && attempt === 1) {
            console.warn(`[Callback] WhatsApp rate limited — retrying in 65s for order ${fullOrder.order_number}`);
            setTimeout(() => sendReceipt(2), 65_000);
          } else {
            console.error(`[Callback] WhatsApp receipt failed (attempt ${attempt}):`, result.error);
          }
        };
        sendReceipt().catch((e) => console.error("[Callback] WhatsApp send error:", e));
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
