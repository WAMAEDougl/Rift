import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/supabase"
import { ok, err } from "@/lib/admin/response"
import { z } from "zod"

const createOrderSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_phone: z.string().min(9, "Valid phone number is required"),
  customer_email: z.string().email().optional().or(z.literal("")),
  delivery_type: z.enum(["delivery", "pickup", "shipping"]),
  delivery_address: z.string().min(1, "Delivery address is required"),
  delivery_city: z.string().optional().default("Nairobi"),
  order_notes: z.string().optional(),
  payment_method: z.literal("mpesa"),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, "At least one item is required"),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return err("Unauthorized", "UNAUTHORIZED", 401)
  }

  const body = await request.json()
  const parsed = createOrderSchema.safeParse(body)

  if (!parsed.success) {
    return err(parsed.error.issues[0].message, "VALIDATION_ERROR", 400)
  }

  const data = parsed.data

  try {
    const admin = getAdminClient()

    const { data: products, error: productsError } = await admin
      .from("products")
      .select("id, name, price")
      .in("id", data.items.map(i => i.product_id))

    if (productsError || !products) {
      return err("Failed to fetch products", "INTERNAL_ERROR", 500)
    }

    const productMap = new Map(products.map(p => [p.id, p]))
    let subtotal = 0
    const orderItems = []

    for (const item of data.items) {
      const product = productMap.get(item.product_id)
      if (!product) {
        return err(`Product not found: ${item.product_id}`, "NOT_FOUND", 404)
      }
      const lineTotal = product.price * item.quantity
      subtotal += lineTotal
      orderItems.push({
        product_id: item.product_id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        line_total: lineTotal,
      })
    }

    const deliveryFee = subtotal >= 2000 || data.delivery_type === "pickup" ? 0 : 200
    const total = subtotal + deliveryFee

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        delivery_address: data.delivery_address,
        delivery_city: data.delivery_city,
        delivery_type: data.delivery_type,
        order_notes: data.order_notes || null,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: data.payment_method,
        payment_status: "processing",
        status: "pending",
        customer_id: user.id,
      })
      .select("id, order_number")
      .single()

    if (orderError || !order) {
      return err("Failed to create order", "INTERNAL_ERROR", 500)
    }

    const itemsWithOrderId = orderItems.map(item => ({ ...item, order_id: order.id }))
    const { error: itemsError } = await admin.from("order_items").insert(itemsWithOrderId)

    if (itemsError) {
      await admin.from("orders").delete().eq("id", order.id)
      return err("Failed to create order items", "INTERNAL_ERROR", 500)
    }

    return ok({ order })
  } catch (error) {
    console.error("Create order error:", error)
    return err("Internal server error", "INTERNAL_ERROR", 500)
  }
}
