/**
 * WaSender service module — all WhatsApp API calls go through here.
 * Never throws — all error paths return { success: false, error: string }.
 */

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

const DEFAULT_BASE_URL = "https://app.wasender.app/api";
const TIMEOUT_MS = 10_000;

function getConfig(): { token: string; baseUrl: string } | null {
  const token = process.env.WASENDER_API_TOKEN;
  if (!token) {
    console.warn("[WaSender] WASENDER_API_TOKEN is not configured");
    return null;
  }
  return {
    token,
    baseUrl: process.env.WASENDER_API_BASE_URL ?? DEFAULT_BASE_URL,
  };
}

async function request<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<WaSenderResult<T>> {
  const config = getConfig();
  if (!config) {
    return { success: false, error: "WASENDER_API_TOKEN is not configured" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[WaSender] HTTP ${res.status}: ${text}`);
      return { success: false, error: `HTTP ${res.status}: ${text || res.statusText}` };
    }

    let data: T;
    try {
      data = await res.json();
    } catch {
      console.error("[WaSender] Invalid JSON response");
      return { success: false, error: "Invalid response from WaSender" };
    }

    return { success: true, data };
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("abort") || message.includes("timeout")) {
      console.error("[WaSender] Request timed out");
      return { success: false, error: "WaSender request timed out" };
    }
    console.error(`[WaSender] Network error: ${message}`);
    return { success: false, error: `Network error: ${message}` };
  }
}

/**
 * Send a WhatsApp message to a phone number.
 */
export async function sendMessage(
  phone: string,
  body: string
): Promise<WaSenderResult<{ messageId: string }>> {
  return request<{ messageId: string }>("POST", "/messages", { phone, message: body });
}

/**
 * Retrieve message history for a phone number.
 */
export async function getMessageHistory(
  phone: string
): Promise<WaSenderResult<WaSenderMessage[]>> {
  return request<WaSenderMessage[]>("GET", `/messages?phone=${encodeURIComponent(phone)}`);
}

// ── Message Templates ────────────────────────────────────────────────────────

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
    .map((i) => `  • ${i.product_name} x${i.quantity} — KES ${i.line_total.toLocaleString("en-KE")}`)
    .join("\n");

  return `✅ *Order Confirmed — ${order.order_number}*

Thank you for your order! We are processing it now.

*Items:*
${itemLines}

*Subtotal:* KES ${order.subtotal.toLocaleString("en-KE")}
*Total:* KES ${order.total.toLocaleString("en-KE")}

We will be in touch shortly with delivery details and payment instructions. Please check your WhatsApp for further instructions and payment details.

— Rift & Root 🌿`;
}

export function formatPaymentConfirmationMessage(order: {
  order_number: string;
  mpesa_receipt_number: string;
  total: number;
}): string {
  return `💚 *Payment Received — ${order.order_number}*

We have confirmed your M-Pesa payment.

*Receipt:* ${order.mpesa_receipt_number}
*Amount:* KES ${order.total.toLocaleString("en-KE")}

Your order is now being processed and will be ready soon. Thank you for choosing Rift & Root! 🌿`;
}
