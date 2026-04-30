// @ts-nocheck
import { requireAdminSession } from "@/lib/admin/auth";
import { ok } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  return ok({
    id: session.profile.id,
    full_name: session.profile.full_name,
    email: session.profile.email,
    role: session.profile.role,
  });
}

