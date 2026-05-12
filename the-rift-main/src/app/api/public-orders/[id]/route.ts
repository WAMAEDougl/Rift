import { getServiceClient, apiSuccess, apiError } from "@/lib/utils/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getServiceClient();

  const column = id.startsWith("AY-") ? "order_number" : "id";
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, delivery_address, delivery_city, delivery_type, subtotal, delivery_fee, total, payment_method, payment_status, status, created_at, order_items(id, product_name, product_price, quantity, line_total)")
    .eq(column, id)
    .single();

  if (error || !order) {
    return apiError("Order not found", 404);
  }

  return apiSuccess({ order });
}
