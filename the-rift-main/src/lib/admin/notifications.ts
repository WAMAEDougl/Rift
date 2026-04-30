// @ts-nocheck
import { getAdminClient } from "./supabase";

export type NotificationType =
  | "new_order"
  | "payment_completed"
  | "payment_failed"
  | "order_cancelled";

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
