import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "./supabase";
import { err } from "./response";

export type AdminRole = "admin" | "kitchen";

export interface AdminSession {
  user: { id: string; email: string };
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    role: AdminRole;
  };
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

export async function requireAdminSession(
  request: Request,
  requiredRole?: "admin"
): Promise<AdminSession | Response> {
  // 1. Validate session via cookie-based client
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return err("Unauthorized", "UNAUTHORIZED", 401);
  }

  // 2. Fetch profile using service role to bypass RLS
  const admin = getAdminClient();
  const { data: profileData } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  const profile = profileData as ProfileRow | null;

  if (!profile || !["admin", "kitchen"].includes(profile.role)) {
    await supabase.auth.signOut();
    return err("Forbidden", "FORBIDDEN", 403);
  }

  // 3. Enforce admin-only routes
  if (requiredRole === "admin" && profile.role !== "admin") {
    return err("Forbidden", "FORBIDDEN", 403);
  }

  return {
    user: { id: user.id, email: user.email! },
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role: profile.role as AdminRole,
    },
  };
}
