// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

// Generate order number: AY-YYYYMMDD-NNNN
export async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

  // Count today's orders
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfDay);

  const seq = ((count || 0) + 1).toString().padStart(4, "0");
  return `AY-${dateStr}-${seq}`;
}

// Calculate delivery fee
export function calculateDeliveryFee(
  subtotal: number,
  deliveryType: string,
  city: string
): number {
  if (deliveryType === "pickup") return 0;
  if (subtotal >= 2000) return 0; // Free delivery over KES 2,000

  // Nairobi delivery
  if (city.toLowerCase() === "nairobi") return 200;

  // Countrywide shipping (packaged products)
  if (deliveryType === "shipping") return 350;

  return 200;
}

// Validate order items against DB products
export async function validateOrderItems(
  items: { product_id: string; quantity: number }[]
): Promise<{
  valid: boolean;
  validatedItems: Array<{
    product_id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    line_total: number;
  }>;
  subtotal: number;
  error?: string;
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (!items || items.length === 0) {
    return { valid: false, validatedItems: [], subtotal: 0, error: "No items in order" };
  }

  const productIds = items.map((i) => i.product_id);

  // Try by UUID first, then by legacy_id (meal-001 style)
  const isUUID = productIds[0]?.match(/^[0-9a-f]{8}-/);

  let products;
  let error;

  if (isUUID) {
    const result = await supabase
      .from("products")
      .select("id, legacy_id, name, price, in_stock, is_active")
      .in("id", productIds);
    products = result.data;
    error = result.error;
  } else {
    // Cart uses legacy IDs like "meal-001", "bev-001", etc.
    const result = await supabase
      .from("products")
      .select("id, legacy_id, name, price, in_stock, is_active")
      .in("legacy_id", productIds);
    products = result.data;
    error = result.error;
  }

  if (error || !products || products.length === 0) {
    return { valid: false, validatedItems: [], subtotal: 0, error: "Failed to fetch products" };
  }

  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) =>
      p.id === item.product_id || p.legacy_id === item.product_id
    );
    if (!product) {
      return { valid: false, validatedItems: [], subtotal: 0, error: `Product ${item.product_id} not found` };
    }
    if (!product.in_stock || !product.is_active) {
      return { valid: false, validatedItems: [], subtotal: 0, error: `${product.name} is out of stock` };
    }
    if (item.quantity < 1) {
      return { valid: false, validatedItems: [], subtotal: 0, error: `Invalid quantity for ${product.name}` };
    }

    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;
    validatedItems.push({
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity: item.quantity,
      line_total: lineTotal,
    });
  }

  return { valid: true, validatedItems, subtotal };
}
