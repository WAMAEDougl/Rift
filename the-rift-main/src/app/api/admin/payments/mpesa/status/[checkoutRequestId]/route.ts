import { requireAdminSession } from "@/lib/admin/auth";
import { querySTKStatus } from "@/lib/mpesa";
import { ok, err } from "@/lib/admin/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ checkoutRequestId: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { checkoutRequestId } = await params;

  try {
    const result = await querySTKStatus(checkoutRequestId);
    return ok(result);
  } catch {
    return err("Failed to query STK status", "INTERNAL_ERROR", 500);
  }
}
