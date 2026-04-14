import { getServiceClient } from "@/lib/utils/api";
import { NextResponse } from "next/server";

// Customer-facing cancel — only allows cancelling orders with payment_status = 'processing' or 'failed'
// Used when M-Pesa STK push is cancelled/fails
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = getServiceClient();

    // Only cancel if payment hasn't completed
    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_status, status")
      .eq("id", id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancelling if payment is still processing or failed
    if (!["processing", "failed", "pending"].includes(order.payment_status)) {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 409 });
    }

    await supabase
      .from("orders")
      .update({ status: "cancelled", payment_status: "failed" })
      .eq("id", id);

    return NextResponse.json({ cancelled: true });
  } catch {
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 });
  }
}
