import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") ?? "14") || 14));

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("total, created_at")
    .eq("payment_status", "completed")
    .gte("created_at", since.toISOString());

  if (error) {
    return err("Failed to fetch revenue data", "INTERNAL_ERROR", 500);
  }

  // Aggregate by date in JS
  const byDate = new Map<string, number>();
  for (const row of data ?? []) {
    const date = row.created_at.slice(0, 10); // "YYYY-MM-DD"
    byDate.set(date, (byDate.get(date) ?? 0) + (row.total ?? 0));
  }

  // Build sorted array
  const result = Array.from(byDate.entries())
    .map(([date, revenue_kes]) => ({ date, revenue_kes }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return ok(result);
}

