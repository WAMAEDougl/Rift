// @ts-nocheck
import { requireAdminSession } from "@/lib/admin/auth";
import { getOAuthToken } from "@/lib/mpesa";
import { ok } from "@/lib/admin/response";

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  try {
    await getOAuthToken();
    const environment =
      process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox";
    return ok({ success: true, environment, message: "M-Pesa credentials are valid." });
  } catch (error) {
    return ok({
      success: false,
      message: `Failed to authenticate: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

