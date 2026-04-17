import { getServiceClient } from "@/lib/utils/api";
import { createNotification } from "@/lib/admin/notifications";

// WaSenderAPI webhook payload for personal message received
// Event: messages-personal.received
interface WaSenderWebhookPayload {
  event?: string;
  data?: {
    messages?: {
      key?: {
        fromMe?: boolean;
        remoteJid?: string;
        cleanedSenderPn?: string;
      };
      messageBody?: string;
    };
  };
  // Legacy / fallback flat fields
  phone?: string;
  message?: string;
  [key: string]: unknown;
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = body as WaSenderWebhookPayload;

  // Log the raw payload in dev to help diagnose field names
  console.log("[Webhook/WaSender] Received payload:", JSON.stringify(payload));

  // Extract phone and message from WaSenderAPI nested structure
  // Falls back to flat { phone, message } for manual testing
  const messages = payload?.data?.messages;
  const phone =
    messages?.key?.cleanedSenderPn ??   // e.g. "254712345678"
    messages?.key?.remoteJid?.replace("@s.whatsapp.net", "") ?? // e.g. "254712345678@s.whatsapp.net"
    payload.phone ??
    "";

  const message =
    messages?.messageBody ??
    payload.message ??
    "";

  // Skip messages sent by us (fromMe = true)
  if (messages?.key?.fromMe === true) {
    return new Response(null, { status: 200 });
  }

  // Validate non-empty phone and message
  if (!phone.trim() || !message.trim()) {
    console.warn("[Webhook/WaSender] Missing phone or message in payload");
    return new Response(
      JSON.stringify({ error: "phone and message are required non-empty strings" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Normalise phone: strip leading + so it matches the DB format (254...)
  const normalizedPhone = phone.startsWith("+") ? phone.slice(1) : phone;

  // Query orders for a matching pending_delivery_confirmation order
  const supabase = getServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("customer_phone", normalizedPhone)
    .eq("status", "pending_delivery_confirmation")
    .maybeSingle();

  if (error) {
    console.error("[Webhook/WaSender] DB query error:", error);
    return new Response(null, { status: 200 });
  }

  if (!order) {
    console.log(
      `[Webhook/WaSender] No pending_delivery_confirmation order for phone: ${normalizedPhone}`
    );
    return new Response(null, { status: 200 });
  }

  // Truncate message to 100 characters
  const truncatedMessage = message.slice(0, 100);

  // Create admin notification
  await createNotification(
    "delivery_negotiation_message",
    "Customer replied to delivery inquiry",
    truncatedMessage,
    order.id
  );

  console.log(`[Webhook/WaSender] Notification created for order ${order.order_number}`);

  return new Response(null, { status: 200 });
}
