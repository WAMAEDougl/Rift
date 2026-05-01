import { getServiceClient, apiSuccess, apiError } from "@/lib/utils/api";
import { normalizePhone } from "@/lib/utils/validation";

// GET /api/customers/lookup?phone=0712345678
// Returns customer profile + order history by phone (no auth required)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPhone = searchParams.get("phone");

  if (!rawPhone || rawPhone.replace(/\D/g, "").length < 9) {
    return apiError("Valid phone number required");
  }

  const phone = normalizePhone(rawPhone);
  const supabase = getServiceClient();

  // Find orders by phone
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, payment_status, payment_method, created_at, delivery_type, delivery_city")
    .eq("customer_phone", phone)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return apiError("Failed to fetch orders", 500);
  }

  // Get customer name from most recent order
  const customerName = orders?.[0]
    ? (await supabase.from("orders").select("customer_name, customer_email, delivery_address").eq("customer_phone", phone).order("created_at", { ascending: false }).limit(1).single()).data
    : null;

  return apiSuccess({
    customer: customerName ? {
      name: customerName.customer_name,
      phone,
      email: customerName.customer_email,
      address: customerName.delivery_address,
    } : null,
    orders: orders || [],
    total_orders: orders?.length || 0,
  });
}
