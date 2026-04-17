// WaSender REST API — WhatsApp Messaging Service
// Docs: https://app.wasender.app/api

const DEFAULT_BASE_URL = "https://app.wasender.app/api";
const REQUEST_TIMEOUT_MS = 10_000;

// Discriminated union result type — never throws, always returns structured result
export type WaSenderResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface WaSenderMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  timestamp: string; // ISO 8601
  direction: "sent" | "received";
}

// Send a WhatsApp message to a phone number
export async function sendMessage(
  phone: string,
  body: string
): Promise<WaSenderResult<{ messageId: string }>> {
  const token = process.env.WASENDER_API_TOKEN;
  const baseUrl = process.env.WASENDER_API_BASE_URL ?? DEFAULT_BASE_URL;

  if (!token) {
    console.warn("[WaSender] WASENDER_API_TOKEN is not configured");
    return { success: false, error: "WASENDER_API_TOKEN is not configured" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, message: body }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const responseBody = await res.text().catch(() => "");
      console.error(`[WaSender] HTTP ${res.status}: ${responseBody}`);
      return { success: false, error: `HTTP ${res.status}: ${responseBody}` };
    }

    const data = await res.json();
    return { success: true, data: { messageId: data.messageId ?? data.id ?? "" } };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[WaSender] Network error: request timed out");
      return { success: false, error: "WaSender request timed out" };
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[WaSender] Network error: ${message}`);
    return { success: false, error: `Network error: ${message}` };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Retrieve message history for a phone number
export async function getMessageHistory(
  phone: string
): Promise<WaSenderResult<WaSenderMessage[]>> {
  const token = process.env.WASENDER_API_TOKEN;
  const baseUrl = process.env.WASENDER_API_BASE_URL ?? DEFAULT_BASE_URL;

  if (!token) {
    console.warn("[WaSender] WASENDER_API_TOKEN is not configured");
    return { success: false, error: "WASENDER_API_TOKEN is not configured" };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `${baseUrl}/messages?phone=${encodeURIComponent(phone)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    );

    if (!res.ok) {
      const responseBody = await res.text().catch(() => "");
      console.error(`[WaSender] HTTP ${res.status}: ${responseBody}`);
      return { success: false, error: `HTTP ${res.status}: ${responseBody}` };
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      console.error("[WaSender] Invalid response from WaSender: malformed JSON");
      return { success: false, error: "Invalid response from WaSender" };
    }

    const messages = Array.isArray(json) ? json : (json as { messages?: WaSenderMessage[] }).messages ?? [];
    return { success: true, data: messages as WaSenderMessage[] };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[WaSender] Network error: request timed out");
      return { success: false, error: "WaSender request timed out" };
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[WaSender] Network error: ${message}`);
    return { success: false, error: `Network error: ${message}` };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Message template functions (pure — no side effects)

export function formatOrderConfirmationMessage(order: {
  order_number: string;
  items: Array<{
    product_name: string;
    quantity: number;
    product_price: number;
    line_total: number;
  }>;
  subtotal: number;
  total: number;
}): string {
  const itemLines = order.items
    .map(
      (item) =>
        `  • ${item.product_name} x${item.quantity} — KES ${item.line_total}`
    )
    .join("\n");

  return [
    `🛒 *Order Confirmation — #${order.order_number}*`,
    "",
    "Your order is now *processing*. Here's a summary:",
    "",
    itemLines,
    "",
    `Subtotal: KES ${order.subtotal}`,
    `Total: KES ${order.total}`,
    "",
    "We'll be in touch shortly with delivery details and payment instructions.",
    "Thank you for shopping with Ayola Foods! 🌿",
  ].join("\n");
}

export function formatPaymentConfirmationMessage(order: {
  order_number: string;
  mpesa_receipt_number: string;
  total: number;
}): string {
  return [
    `✅ *Payment Confirmed — #${order.order_number}*`,
    "",
    `M-Pesa Receipt: *${order.mpesa_receipt_number}*`,
    `Amount Paid: KES ${order.total}`,
    "",
    "Your order is now being processed and will be prepared for delivery.",
    "Thank you for your payment! 🙏",
  ].join("\n");
}

// Sent immediately after order creation to ask the customer for their delivery location
export function formatDeliveryInquiryMessage(order: {
  order_number: string;
}): string {
  return [
    `📦 *Order #${order.order_number} — Delivery Details*`,
    "",
    "Please share your specific location so we can calculate the delivery fee.",
  ].join("\n");
}

// Sent by the admin when triggering the STK Push, confirming the agreed delivery fee
export function formatPaymentRequestNotificationMessage(order: {
  order_number: string;
  delivery_fee: number;
}): string {
  return [
    `💳 *Order #${order.order_number} — Payment Request*`,
    "",
    `Delivery fee confirmed at KES ${order.delivery_fee}. We are now sending a payment prompt to your phone.`,
  ].join("\n");
}

// Sent after M-Pesa payment is confirmed for orders with a negotiated delivery fee
export function formatDeliveryReceiptMessage(order: {
  order_number: string;
  mpesa_receipt_number: string;
  total: number;
  delivery_fee: number;
}): string {
  return [
    `✅ *Payment Received — #${order.order_number}*`,
    "",
    `M-Pesa Receipt: *${order.mpesa_receipt_number}*`,
    `Payment Received! Total: KES ${order.total} (includes KES ${order.delivery_fee} for delivery). Your order is now being dispatched.`,
  ].join("\n");
}
