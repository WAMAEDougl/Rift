import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "kitchen"]),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  try {
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 422);
    }

    const { email, role, password } = parsed.data;
    const admin = getAdminClient();

    // Create user with password
    const { data: userData, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !userData?.user) {
      return err(
        createError?.message ?? "Failed to create user",
        "INTERNAL_ERROR",
        500
      );
    }

    // Set user role in profiles table
    const { error: upsertError } = await admin.from("profiles").upsert(
      { id: userData.user.id, email, role },
      { onConflict: "id" }
    );

    if (upsertError) {
      return err("Failed to set user role", "INTERNAL_ERROR", 500);
    }

    return ok({ email, role, created: true }, 201);
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
