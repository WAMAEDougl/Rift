import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { parsePagination, paginatedResponse } from "@/lib/admin/pagination";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  try {
    const url = new URL(request.url);
    const { page, per_page, offset } = parsePagination(url.searchParams);

    const isReadParam = url.searchParams.get("is_read");
    const isReadFilter =
      isReadParam === "true" ? true : isReadParam === "false" ? false : null;

    const admin = getAdminClient();

    // Get unread count
    const { count: unread_count } = await admin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    // Build items query
    let itemsQuery = admin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (isReadFilter !== null) {
      itemsQuery = itemsQuery.eq("is_read", isReadFilter);
    }

    const { data: items, error: itemsError } = await itemsQuery.range(
      offset,
      offset + per_page - 1
    );

    if (itemsError) {
      return err("Failed to fetch notifications", "INTERNAL_ERROR", 500);
    }

    // Get total count with same filter
    let countQuery = admin
      .from("notifications")
      .select("*", { count: "exact", head: true });

    if (isReadFilter !== null) {
      countQuery = countQuery.eq("is_read", isReadFilter);
    }

    const { count: total } = await countQuery;

    return ok({
      ...paginatedResponse(items ?? [], total ?? 0, page, per_page),
      unread_count: unread_count ?? 0,
    });
  } catch {
    return err("Internal server error", "INTERNAL_ERROR", 500);
  }
}

