import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/admin/response";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok({ success: true });
}

