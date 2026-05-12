import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

const ALLOWED_PAGES = ["about", "community"] as const;
type AllowedPage = (typeof ALLOWED_PAGES)[number];

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") as AllowedPage | null;
  if (!page || !ALLOWED_PAGES.includes(page)) return err("Unknown page", "NOT_FOUND", 404);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("page_content")
    .select("content, updated_at")
    .eq("page", page)
    .single();

  if (error && error.code !== "PGRST116") return err("Failed to fetch content", "INTERNAL_ERROR", 500);
  return ok(data ?? { content: {}, updated_at: null });
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") as AllowedPage | null;
  if (!page || !ALLOWED_PAGES.includes(page)) return err("Unknown page", "NOT_FOUND", 404);

  let body: unknown;
  try { body = await request.json(); } catch { return err("Invalid JSON", "VALIDATION_ERROR", 422); }
  if (typeof body !== "object" || body === null) return err("Content must be an object", "VALIDATION_ERROR", 422);

  const admin = getAdminClient();
  const { error } = await admin
    .from("page_content")
    .upsert({ page, content: body, updated_at: new Date().toISOString() }, { onConflict: "page" });

  if (error) return err("Failed to save content", "INTERNAL_ERROR", 500);
  return ok({ saved: true });
}
