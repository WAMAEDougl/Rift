import { getServiceClient, apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order_number")?.trim().toUpperCase();
  const phone = searchParams.get("phone")?.trim();

  if (!orderNumber || !phone) {
    return apiError("Order number and phone number are required", 400);
  }

  const supabase = getServiceClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_phone, status, created_at, delivery_type, delivery_city, total, order_items(id, product_name, quantity, line_total)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) {
    return apiError("Order not found. Check your order number and phone number.", 404);
  }

  const normalize = (p: string) => p.replace(/\D/g, "").slice(-9);
  if (normalize(order.customer_phone) !== normalize(phone)) {
    return apiError("Order not found. Check your order number and phone number.", 404);
  }

  const { customer_phone: _ph, ...safeOrder } = order;
  return apiSuccess({ order: safeOrder });
}
