import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/admin/response";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  // Clear hardcoded session cookie if present
  cookieStore.delete("admin_hardcoded_session");

  // Also sign out of Supabase if there's a session
  const supabase = await createClient();
  await supabase.auth.signOut();

  return ok({ success: true });
}
