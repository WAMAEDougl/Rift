import { getAdminClient } from "./supabase";

export type NotificationType =
  | "new_order"
  | "payment_completed"
  | "payment_failed"
  | "order_cancelled"
  | "delivery_negotiation_message"
  | "whatsapp_sent";

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  orderId?: string
): Promise<void> {
  const admin = getAdminClient();
  await admin
    .from("notifications")
    .insert({ type, title, message, order_id: orderId ?? null });
}
