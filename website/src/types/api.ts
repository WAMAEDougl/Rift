// Shared API types — single source of truth for request/response shapes

// ============================================
// PRODUCTS
// ============================================
export interface ProductResponse {
  id: string;
  legacy_id: string | null;
  slug: string;
  name: string;
  category_id: string;
  description: string | null;
  long_description: string | null;
  price: number;
  size: string | null;
  image_url: string | null;
  features: string[];
  ingredients: string | null;
  nutrition_highlights: string[];
  badge: string | null;
  in_stock: boolean;
  is_active: boolean;
  category?: CategoryResponse;
}

export interface CategoryResponse {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  icon: string | null;
  description: string | null;
  color: string | null;
  bg_color: string | null;
  ships_countrywide: boolean;
  price_from: number | null;
}

// ============================================
// ORDERS
// ============================================
export interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_type: "delivery" | "pickup" | "shipping";
  order_notes?: string;
  payment_method: "mpesa" | "cash_on_delivery";
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  product_id: string;
  quantity: number;
}

export interface CreateOrderResponse {
  order: {
    id: string;
    order_number: string;
    status: string;
    subtotal: number;
    delivery_fee: number;
    total: number;
    payment_method: string;
    payment_status: string;
  };
  mpesa: {
    checkout_request_id: string;
    message: string;
  } | null;
  items: ValidatedOrderItem[];
}

export interface ValidatedOrderItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string;
  delivery_city: string;
  delivery_type: string;
  order_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: PaymentStatus;
  mpesa_receipt_number: string | null;
  created_at: string;
  order_items: ValidatedOrderItem[];
}

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "dispatched" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

// ============================================
// CUSTOMER (persisted locally)
// ============================================
export interface SavedCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
}

// ============================================
// API ERROR
// ============================================
export interface ApiError {
  error: string;
  details?: string;
}
