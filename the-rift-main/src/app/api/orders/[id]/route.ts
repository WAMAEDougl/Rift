// @ts-nocheck
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
    .select("*, order_items(*)")
    .eq(column, id)
    .single();

  if (error || !order) {
    return apiError("Order not found", 404);
  }

  return apiSuccess({ order });
}
