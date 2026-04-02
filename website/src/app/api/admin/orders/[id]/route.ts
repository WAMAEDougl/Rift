import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select("*, order_items(id, product_id, product_name, product_price, quantity, line_total)")
    .eq("id", id)
    .single();

  if (error || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  return ok(order);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request, "admin");
  if (session instanceof Response) return session;

  const { id } = await params;
  const admin = getAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("id, status")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  if (order.status !== "cancelled") {
    return err("Only cancelled orders can be deleted", "CONFLICT", 409);
  }

  const { error: deleteError } = await admin
    .from("orders")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return err("Failed to delete order", "INTERNAL_ERROR", 500);
  }

  return ok({ deleted: true });
}
