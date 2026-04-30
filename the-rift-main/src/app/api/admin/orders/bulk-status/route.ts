// @ts-nocheck
import { z } from "zod";
import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { TERMINAL_STATUSES, OrderStatus } from "@/lib/admin/types";

const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  status: z.enum(["confirmed", "cancelled"]),
  cancel_reason: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err("Invalid JSON body", "VALIDATION_ERROR", 422);
  }

  const parsed = bulkStatusSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Validation error";
    return err(firstIssue, "VALIDATION_ERROR", 422);
  }

  const { ids, status } = parsed.data;

  const admin = getAdminClient();

  // Fetch all orders by ids
  const { data: orders, error: fetchError } = await admin
    .from("orders")
    .select("id, status")
    .in("id", ids);

  if (fetchError) {
    return err("Failed to fetch orders", "INTERNAL_ERROR", 500);
  }

  const foundOrders = orders ?? [];

  // Separate terminal (skip) from non-terminal (update)
  const skippedOrders = foundOrders.filter((o) =>
    TERMINAL_STATUSES.includes(o.status as OrderStatus)
  );
  const toUpdate = foundOrders.filter(
    (o) => !TERMINAL_STATUSES.includes(o.status as OrderStatus)
  );

  const skipped_ids = skippedOrders.map((o) => o.id);

  if (toUpdate.length > 0) {
    const { error: updateError } = await admin
      .from("orders")
      .update({ status } as never)
      .in(
        "id",
        toUpdate.map((o) => o.id)
      );

    if (updateError) {
      return err("Failed to update orders", "INTERNAL_ERROR", 500);
    }
  }

  return ok({
    updated: toUpdate.length,
    skipped: skipped_ids.length,
    skipped_ids,
  });
}

