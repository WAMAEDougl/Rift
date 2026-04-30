import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";
import { ok, err } from "@/lib/admin/response";
import { z } from "zod";

const updateDeliverySchema = z.object({
  delivery_address: z.string().min(1).optional(),
  delivery_city: z.string().min(1).optional(),
  delivery_type: z.enum(["delivery", "pickup", "shipping"]).optional(),
  customer_name: z.string().min(1).optional(),
  customer_phone: z.string().min(1).optional(),
  customer_email: z.string().email().optional().or(z.literal("")),
}).partial();

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession(request);
  if (session instanceof Response) return session;

  const { id } = await params;
  const body = await request.json();

  const parsed = updateDeliverySchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 400);
  }

  const admin = getAdminClient();

  const { data: order, error: fetchError } = await admin
    .from("orders")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return err("Order not found", "NOT_FOUND", 404);
  }

  const { error: updateError } = await admin
    .from("orders")
    .update(parsed.data as Record<string, unknown>)
    .eq("id", id);

  if (updateError) {
    return err("Failed to update order", "INTERNAL_ERROR", 500);
  }

  return ok({ updated: true });
}
