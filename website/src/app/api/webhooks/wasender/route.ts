import { getServiceClient } from "@/lib/utils/api";
import { createNotification } from "@/lib/admin/notifications";

interface WaSenderInboundPayload {
  phone: string;
  message: string;
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

  const payload = body as WaSenderInboundPayload;

  // Validate that phone and message are non-empty strings (Requirement 3.6)
  if (
    typeof payload.phone !== "string" ||
    payload.phone.trim() === "" ||
    typeof payload.message !== "string" ||
    payload.message.trim() === ""
  ) {
    return new Response(
      JSON.stringify({ error: "phone and message are required non-empty strings" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { phone, message } = payload;

  // Query orders for a matching pending_delivery_confirmation order (Requirement 3.2)
  const supabase = getServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("customer_phone", phone)
    .eq("status", "pending_delivery_confirmation")
    .maybeSingle();

  if (error) {
    console.error("[Webhook/WaSender] DB query error:", error);
    // Still return 200 to prevent WaSender retries (Requirement 3.5)
    return new Response(null, { status: 200 });
  }

  if (!order) {
    // No matching order — log and return 200 (Requirement 3.4)
    console.log(
      `[Webhook/WaSender] No pending_delivery_confirmation order found for phone: ${phone}`
    );
    return new Response(null, { status: 200 });
  }

  // Truncate message to 100 characters (Requirement 3.3)
  const truncatedMessage = message.slice(0, 100);

  // Create admin notification (Requirements 3.2, 9.2)
  await createNotification(
    "delivery_negotiation_message",
    "Customer replied to delivery inquiry",
    truncatedMessage,
    order.id
  );

  // Always return 200 to prevent WaSender retries (Requirement 3.5)
  return new Response(null, { status: 200 });
}
