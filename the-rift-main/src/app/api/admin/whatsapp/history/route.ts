import { requireAdminSession } from "@/lib/admin/auth";
import { getMessageHistory } from "@/lib/wasender";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const phone = url.searchParams.get("phone");

  if (!phone) {
    return err("phone query parameter is required", "VALIDATION_ERROR", 422);
  }

  const result = await getMessageHistory(phone);

  if (!result.success) {
    return err(result.error, "INTERNAL_ERROR", 500);
  }

  return ok(result.data);
}

