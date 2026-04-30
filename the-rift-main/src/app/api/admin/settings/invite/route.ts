import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "kitchen"]),
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

    const { email, role } = parsed.data;
    const admin = getAdminClient();

    const { data: inviteData, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email);

    if (inviteError || !inviteData?.user) {
      return err(
        inviteError?.message ?? "Failed to invite user",
        "INTERNAL_ERROR",
        500
      );
    }

    const { error: upsertError } = await admin.from("profiles").upsert(
      { id: inviteData.user.id, email, role } as Record<string, unknown>,
      { onConflict: "id" }
    );

    if (upsertError) {
      return err("Failed to set user role", "INTERNAL_ERROR", 500);
    }

    return ok({ email, role, invited: true }, 201);
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}
