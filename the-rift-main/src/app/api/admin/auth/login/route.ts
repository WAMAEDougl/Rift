import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// TODO: replace with Supabase auth once accounts are set up
const HARDCODED_ADMINS = [
  {
    id: "hardcoded-admin-1",
    email: "admin@riftandroot.com",
    password: "Admin@1234",
    full_name: "Admin",
    role: "admin",
  },
  {
    id: "hardcoded-kitchen-1",
    email: "kitchen@riftandroot.com",
    password: "Kitchen@1234",
    full_name: "Kitchen Staff",
    role: "kitchen",
  },
];

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

  // ── Hardcoded credential check (temporary) ──
  const hardcoded = HARDCODED_ADMINS.find(
    (u) => u.email === email && u.password === password
  );
  if (hardcoded) {
    const cookieStore = await cookies();
    cookieStore.set("admin_hardcoded_session", JSON.stringify({
      id: hardcoded.id,
      email: hardcoded.email,
      full_name: hardcoded.full_name,
      role: hardcoded.role,
    }), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
    });

    return ok({
      id: hardcoded.id,
      email: hardcoded.email,
      full_name: hardcoded.full_name,
      role: hardcoded.role,
    });
  }

  // ── Supabase auth fallback ──
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return err("Invalid email or password", "UNAUTHORIZED", 401);
  }

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", authData.user.id)
    .single();

  if (!profile || !["admin", "kitchen"].includes(profile.role)) {
    await supabase.auth.signOut();
    return err("Access denied", "FORBIDDEN", 403);
  }

  return ok({
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
  });
}
