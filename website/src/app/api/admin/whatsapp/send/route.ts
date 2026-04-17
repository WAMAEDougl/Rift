import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { sendMessage } from "@/lib/wasender";
import { phoneSchema } from "@/lib/utils/validation";

const sendMessageSchema = z.object({
  phone: phoneSchema,
  message: z.string().min(1, "Message must not be empty"),
  order_id: z.string().uuid().optional(), // optional — used to store sent message in thread
});

export async function POST(request: Request): Promise<Response> {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return err(message, "VALIDATION_ERROR", 422);
  }

  const { phone, message, order_id } = parsed.data;

  const result = await sendMessage(phone, message);

  if (!result.success) {
    console.error("[WhatsApp send] sendMessage failed:", result.error);
    return err(result.error, "INTERNAL_ERROR", 500);
  }

  // Store sent message as a notification so it appears in the WhatsApp thread
  if (order_id) {
    const admin = getAdminClient();
    try {
      await admin.from("notifications").insert({
        type: "whatsapp_sent",
        title: "WhatsApp message sent",
        message: message.slice(0, 500),
        order_id,
      });
    } catch (e) {
      console.error("[WhatsApp send] Failed to store sent message:", e);
    }
  }

  return ok({ messageId: result.data.messageId });
}
