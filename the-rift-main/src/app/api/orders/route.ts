import { createOrderSchema } from "@/lib/utils/validation";
import { getServiceClient, apiError, apiSuccess, checkRateLimit } from "@/lib/utils/api";
import { generateOrderNumber, calculateDeliveryFee, validateOrderItems } from "@/lib/order-utils";
import { createNotification } from "@/lib/admin/notifications";

async function sendOrderConfirmationEmail(params: {
  email: string;
  name: string;
  orderNumber: string;
  total: number;
  items: { product_name: string; quantity: number; line_total: number }[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const itemRows = params.items
    .map((i) => `<tr><td>${i.quantity}x ${i.product_name}</td><td>KES ${i.line_total.toLocaleString()}</td></tr>`)
    .join("");

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: "Rift & Root <orders@riftandroot.co.ke>",
      to: params.email,
      subject: `Order Confirmed — ${params.orderNumber}`,
      html: `<h2>Thanks for your order, ${params.name}!</h2>
<p>Your order <strong>${params.orderNumber}</strong> has been received.</p>
<table>${itemRows}</table>
<p><strong>Subtotal: KES ${params.total.toLocaleString()}</strong></p>
<p>Delivery fee will be confirmed via WhatsApp. We'll be in touch shortly.</p>`,
    }),
  }).catch(() => {});
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && origin && origin !== siteUrl) {
    return apiError("Forbidden", 403);
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (!checkRateLimit(`order:${ip}`, 5, 60000)) {
    return apiError("Too many orders. Please wait a minute.", 429);
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
      data.delivery_city ?? "Nairobi"
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
        payment_status:
          data.payment_method === "cash_on_delivery" ? "pending" : "processing",
        status: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
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
      console.error("Order items error:", itemsError);
      await supabase.from("orders").delete().eq("id", order.id);
      return apiError("Failed to create order items", 500);
    }

    createNotification(
      "new_order",
      `New Order #${order.order_number}`,
      `New order placed by ${data.customer_name}`,
      order.id
    );

    if (data.customer_email) {
      sendOrderConfirmationEmail({
        email: data.customer_email,
        name: data.customer_name,
        orderNumber: order.order_number,
        total: validation.subtotal,
        items: validation.validatedItems,
      });
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
        payment_status:
          data.payment_method === "cash_on_delivery" ? "pending" : "processing",
      },
      items: validation.validatedItems,
    });
  } catch (err) {
    console.error("Order API error:", err);
    return apiError("Internal server error", 500);
  }
}
