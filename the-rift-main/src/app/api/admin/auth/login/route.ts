import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Validation error", "VALIDATION_ERROR", 422);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 422);
  }

  const { email, password } = parsed.data;

  // Sign in via Supabase Auth
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return err("Invalid email or password", "UNAUTHORIZED", 401);
  }

  // Check the user has admin or kitchen role
  const admin = getAdminClient();
  const { data: profileData } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", authData.user.id)
    .single();

  const profile = profileData as ProfileRow | null;

  if (!profile || !["admin", "kitchen"].includes(profile.role)) {
    await supabase.auth.signOut();
    return err("Access denied. Admin or kitchen role required.", "FORBIDDEN", 403);
  }

  return ok({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
  });
}
