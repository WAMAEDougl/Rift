import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const PAGE_KEY_PREFIX = "page_config_";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return err("Missing slug", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("page_content")
    .select("content, updated_at")
    .eq("page", `${PAGE_KEY_PREFIX}${slug}`)
    .single();

  if (error && error.code !== "PGRST116") {
    const hint = error.code === "42P01"
      ? "Database table missing — run migration 003_content_tables.sql in Supabase."
      : error.message;
    return err(hint, "INTERNAL_ERROR", 500);
  }
  return ok(data ?? { content: {}, updated_at: null });
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: { slug?: string; config?: unknown };
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }

  const { slug, config } = body;
  if (!slug || typeof slug !== "string") return err("Missing slug", "VALIDATION_ERROR", 422);
  if (config === undefined) return err("Missing config", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { error } = await admin
    .from("page_content")
    .upsert(
      { page: `${PAGE_KEY_PREFIX}${slug}`, content: config, updated_at: new Date().toISOString() },
      { onConflict: "page" }
    );

  if (error) {
    const hint = error.code === "42P01"
      ? "Database table missing — run migration 003_content_tables.sql in Supabase."
      : error.message;
    return err(hint, "INTERNAL_ERROR", 500);
  }
  return ok({ saved: true });
}
