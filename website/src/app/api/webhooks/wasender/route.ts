import { getServiceClient } from "@/lib/utils/api";
import { createNotification } from "@/lib/admin/notifications";

// WaSenderAPI webhook payload
// Handles both messages.upsert (array) and messages-personal.received (object)
interface MessageEntry {
  key?: {
    fromMe?: boolean;
    remoteJid?: string;
    cleanedSenderPn?: string;
  };
  messageBody?: string;
}

interface WaSenderWebhookPayload {
  event?: string;
  data?: {
    messages?: MessageEntry | MessageEntry[]; // array in upsert, object in personal.received
  };
  // Flat fallback for manual testing
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

  // Log raw payload to help diagnose any remaining issues
  console.log("[Webhook/WaSender] Event:", payload?.event, "| Raw:", JSON.stringify(payload).slice(0, 300));

  // Normalise messages to an array regardless of event type
  const rawMessages = payload?.data?.messages;
  const messageEntries: MessageEntry[] = rawMessages
    ? Array.isArray(rawMessages) ? rawMessages : [rawMessages]
    : [];

  // Process each message entry (usually just one)
  for (const entry of messageEntries) {
    // Skip messages sent by us
    if (entry?.key?.fromMe === true) continue;

    // Extract phone — cleanedSenderPn is e.g. "254712345678"
    const rawPhone =
      entry?.key?.cleanedSenderPn ??
      entry?.key?.remoteJid?.replace("@s.whatsapp.net", "") ??
      payload.phone ??
      "";

    const messageText = entry?.messageBody ?? payload.message ?? "";

    if (!rawPhone.trim() || !messageText.trim()) continue;

    // Normalise: strip leading + so it matches DB format (254...)
    const phone = rawPhone.startsWith("+") ? rawPhone.slice(1) : rawPhone;

    const supabase = getServiceClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("customer_phone", phone)
      .eq("status", "pending_delivery_confirmation")
      .maybeSingle();

    if (!order) {
      console.log(`[Webhook/WaSender] No pending order for phone: ${phone}`);
      continue;
    }

    const truncated = messageText.slice(0, 100);
    await createNotification(
      "delivery_negotiation_message",
      "Customer replied to delivery inquiry",
      truncated,
      order.id
    );

    console.log(`[Webhook/WaSender] Notification created for order ${order.order_number}`);
  }

  // Always return 200 to prevent WaSenderAPI retries
  return new Response(null, { status: 200 });
}
