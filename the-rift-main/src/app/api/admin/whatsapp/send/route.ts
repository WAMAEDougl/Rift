import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { sendMessage } from "@/lib/wasender";
import { ok, err } from "@/lib/admin/response";

const bodySchema = z.object({
  phone: z.string().min(1),
  message: z.string().min(1, "Message cannot be empty"),
});

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Validation error", "VALIDATION_ERROR", 422);
  }

  const { phone, message } = parsed.data;

  const result = await sendMessage(phone, message);

  if (!result.success) {
    return err(result.error, "INTERNAL_ERROR", 500);
  }

  return ok({ messageId: result.data.messageId });
}
