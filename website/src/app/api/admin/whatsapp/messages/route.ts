import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

// GET /api/admin/whatsapp/messages?order_id=<uuid>
// Returns all inbound (delivery_negotiation_message) and outbound (whatsapp_sent)
// notifications for an order, ordered by created_at ascending.
export async function GET(request: Request): Promise<Response> {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return err("order_id is required", "VALIDATION_ERROR", 422);
  }

  const admin = getAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .select("id, type, title, message, created_at")
    .eq("order_id", orderId)
    .in("type", ["delivery_negotiation_message", "whatsapp_sent"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[WhatsApp messages] DB error:", error);
    return err("Failed to fetch messages", "INTERNAL_ERROR", 500);
  }

  const messages = (data ?? []).map((n) => ({
    id: n.id,
    body: n.message,
    direction: n.type === "whatsapp_sent" ? "sent" : "received",
    timestamp: n.created_at,
  }));

  return ok({ messages });
}
