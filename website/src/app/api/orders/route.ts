import { createOrderSchema } from "@/lib/utils/validation";
import { getServiceClient, apiError, apiSuccess, checkRateLimit } from "@/lib/utils/api";
import { generateOrderNumber, validateOrderItems } from "@/lib/order-utils";
import { createNotification } from "@/lib/admin/notifications";
import { sendMessage, formatOrderConfirmationMessage, formatDeliveryInquiryMessage } from "@/lib/wasender";

export async function POST(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`order:${ip}`, 5, 60000)) {
    return apiError("Too many orders. Please wait a minute.", 429);
  }

  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return apiError(`${firstIssue.path.join(".")}: ${firstIssue.message}`);
    }

    const data = parsed.data;

    // Validate items and get real prices from DB
    const validation = await validateOrderItems(data.items);
    if (!validation.valid) {
      return apiError(validation.error || "Invalid order items");
    }

    const deliveryFee = 0; // Always 0 at creation — admin negotiates and sets via STK Push
    const total = validation.subtotal; // Total = subtotal only until delivery fee is agreed
    const orderNumber = await generateOrderNumber();

    const supabase = getServiceClient();

    // Create order
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
        payment_status: "processing",
        status: "pending_delivery_confirmation",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return apiError("Failed to create order", 500);
    }

    // Create order items
    const orderItems = validation.validatedItems.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      return apiError("Failed to create order items", 500);
    }

    // Fire-and-forget — do not await, do not block response
    sendMessage(data.customer_phone, formatOrderConfirmationMessage({
      order_number: order.order_number,
      items: validation.validatedItems,
      subtotal: validation.subtotal,
      total,
    })).catch((e) => console.error("[Orders API] WhatsApp order confirmation failed:", e));

    sendMessage(data.customer_phone, formatDeliveryInquiryMessage({
      order_number: order.order_number,
    })).catch((e) => console.error("[Orders API] WhatsApp delivery inquiry failed:", e));

    createNotification(
      "new_order",
      `New Order #${order.order_number}`,
      `New order placed by ${data.customer_name}`,
      order.id
    );

    return apiSuccess({
      order: {
        id: order.id,
        order_number: order.order_number,
        status: "pending",
        subtotal: validation.subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: data.payment_method,
        payment_status: "processing",
      },
      items: validation.validatedItems,
    });
  } catch (err) {
    console.error("Order API error:", err);
    return apiError("Internal server error", 500);
  }
}
