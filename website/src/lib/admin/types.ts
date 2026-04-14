export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type NotificationType =
  | "new_order"
  | "payment_completed"
  | "payment_failed"
  | "order_cancelled";

export type AdminRole = "admin" | "kitchen";

export interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: AdminRole;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Ordered sequence — index represents rank
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "dispatched",
  "delivered",
];

export const TERMINAL_STATUSES: OrderStatus[] = ["delivered", "cancelled"];
