import { createClient } from "@/lib/supabase/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { ok } from "@/lib/admin/response";

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const supabase = await createClient();
  await supabase.auth.signOut();

  return ok({ success: true });
}
