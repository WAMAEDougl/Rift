import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const admin = getAdminClient();
  const { data, error } = await admin.from("orders").select("status");

  if (error) {
    return err("Failed to fetch order status summary", "INTERNAL_ERROR", 500);
  }

  // Aggregate counts by status in JS
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const status = row.status ?? "unknown";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  const result = Array.from(counts.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return ok(result);
}

