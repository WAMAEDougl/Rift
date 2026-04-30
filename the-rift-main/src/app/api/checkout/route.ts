// @ts-nocheck
import { createOrderSchema } from "@/lib/utils/validation";
import { getServiceClient, apiError, apiSuccess, checkRateLimit } from "@/lib/utils/api";
import { generateOrderNumber, calculateDeliveryFee, validateOrderItems } from "@/lib/order-utils";

/**
 * POST /api/checkout
 * Validates checkout payload, creates order, returns order confirmation.
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`checkout:${ip}`, 5, 60000)) {
    return apiError("Too many requests. Please wait a minute.", 429);
  }

  try {
    const body = await request.json();

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(`${firstIssue.path.join(".")}: ${firstIssue.message}`);
    }

    const data = parsed.data;

    const validation = await validateOrderItems(data.items);
    if (!validation.valid) {
      return apiError(validation.error || "Invalid order items");
    }

    const deliveryFee = calculateDeliveryFee(
      validation.subtotal,
      data.delivery_type,
      data.delivery_city
    );
    const total = validation.subtotal + deliveryFee;
    const orderNumber = await generateOrderNumber();

    const supabase = getServiceClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        delivery_address: data.delivery_address,
        delivery_city: data.delivery_city,
        delivery_type: data.delivery_type,
        order_notes: data.order_notes || null,
        subtotal: validation.subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: data.payment_method,
        payment_status: "pending",
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return apiError("Failed to create order", 500);
    }

    const orderItems = validation.validatedItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      return apiError("Failed to create order items", 500);
    }

    return apiSuccess({
      order: {
        id: order.id,
        order_number: order.order_number,
        status: "pending",
        subtotal: validation.subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: data.payment_method,
      },
    });
  } catch (err) {
    console.error("Checkout API error:", err);
    return apiError("Internal server error", 500);
  }
}
