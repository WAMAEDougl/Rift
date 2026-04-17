# Design Document — WhatsApp Delivery Negotiation

## Overview

This feature extends the Ayola Foods order flow to support a structured delivery fee negotiation workflow over WhatsApp before payment is requested. The core idea is:

1. A customer places an order → the system holds it in a new `pending_delivery_confirmation` status and immediately sends a WhatsApp message asking for their specific location.
2. An admin views the live WhatsApp thread on the order detail page, agrees on a delivery fee with the customer, then enters the fee and triggers an M-Pesa STK Push from the admin portal.
3. The STK Push API transitions the order to `pending`, records an audit log entry, and sends a WhatsApp notification to the customer confirming the fee and the incoming payment prompt.
4. When M-Pesa confirms payment, the system sends a delivery receipt WhatsApp message that includes the full breakdown (subtotal + delivery fee).

The feature builds on top of the existing WaSender service (`website/src/lib/wasender.ts`), the `WhatsAppPanel` and `AdminSTKPushPanel` components, and the admin STK Push API route.

---

## Architecture

The feature touches five layers of the application:

```
┌─────────────────────────────────────────────────────────────────┐
│  Customer Browser                                               │
│  POST /api/orders  →  order created (pending_delivery_conf.)    │
│                        ↓ fire-and-forget                        │
│                    WaSender: delivery inquiry message           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  WaSender Platform                                              │
│  Customer replies → POST /api/webhooks/wasender                 │
│                        ↓                                        │
│                    createNotification("delivery_negotiation_…") │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Admin Browser                                                  │
│  /admin/orders/[id]  →  status banner + WhatsApp thread         │
│  AdminSTKPushPanel   →  POST /api/admin/orders/[id]/stk-push    │
│                        ↓                                        │
│                    status: pending_delivery_conf → pending      │
│                    order.delivery_fee / total updated           │
│                    audit log inserted                           │
│                    WaSender: payment request notification       │
│                    M-Pesa STK Push initiated                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  M-Pesa Platform                                                │
│  POST /api/payments/mpesa/callback                              │
│  ResultCode=0  →  order status: confirmed                       │
│                   WaSender: delivery receipt message            │
│                   (replaces payment confirmation for fee > 0)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Supabase (PostgreSQL)                                          │
│  orders.status CHECK constraint extended                        │
│  order_audit_logs table (new)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Why a new status instead of a flag?** Using `pending_delivery_confirmation` as a first-class status keeps the existing status-machine logic clean, makes it easy to filter orders awaiting negotiation, and prevents the STK Push from being triggered prematurely — the API rejects requests for orders in this status with HTTP 409.

**Why fire-and-forget for WhatsApp messages?** WhatsApp delivery is best-effort and must not block order creation or payment callbacks. All `sendMessage` calls are fire-and-forget with `.catch()` error logging.

**Why a separate `order_audit_logs` table?** The existing `payment_logs` table is scoped to M-Pesa events. Delivery fee authorization is a business decision made by an admin, not a payment event, so it warrants its own table with a foreign key to `profiles` for the authorizing admin.

**Why does `pending_delivery_confirmation` sit outside `ORDER_STATUS_SEQUENCE`?** The sequence represents the customer-visible order progression. `pending_delivery_confirmation` is an internal holding state before the order enters the normal flow. Including it in the sequence would break the progress bar and status transition logic.

---

## Components and Interfaces

### 1. `website/src/lib/admin/types.ts` — Type Extensions

Add `"pending_delivery_confirmation"` to `OrderStatus` and `"delivery_negotiation_message"` to `NotificationType`.

```typescript
export type OrderStatus =
  | "pending_delivery_confirmation"   // NEW — pre-flow holding state
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type NotificationType =
  | "new_order"
  | "payment_completed"
  | "payment_failed"
  | "order_cancelled"
  | "delivery_negotiation_message";   // NEW
```

`ORDER_STATUS_SEQUENCE` and `TERMINAL_STATUSES` remain unchanged.

### 2. `website/src/lib/admin/status.ts` — Status Transition Logic

`isValidStatusTransition` must be updated to handle the new holding state:

- `"pending_delivery_confirmation"` is **not** in `TERMINAL_STATUSES`, so it is not blocked by the terminal check.
- Valid transitions from `"pending_delivery_confirmation"`: `"pending"` (fee agreed, STK push triggered) and `"cancelled"` (order abandoned).
- All other transitions from `"pending_delivery_confirmation"` are invalid.

```typescript
export function isValidStatusTransition(
  current: OrderStatus,
  next: OrderStatus
): boolean {
  if (TERMINAL_STATUSES.includes(current)) return false;

  // Holding state: only allow transition to pending or cancelled
  if (current === "pending_delivery_confirmation") {
    return next === "pending" || next === "cancelled";
  }

  if (next === "cancelled") return true;
  return (
    ORDER_STATUS_SEQUENCE.indexOf(next) > ORDER_STATUS_SEQUENCE.indexOf(current)
  );
}
```

### 3. `website/src/lib/admin/notifications.ts` — Notification Type Sync

The `NotificationType` local type in this file must be kept in sync with the one in `types.ts`. Add `"delivery_negotiation_message"` to the union.

### 4. `website/src/lib/wasender.ts` — New Message Formatters

Three new pure formatter functions are added (no side effects):

```typescript
// Sent immediately after order creation
export function formatDeliveryInquiryMessage(order: {
  order_number: string;
}): string

// Sent by admin STK Push API when triggering payment
export function formatPaymentRequestNotificationMessage(order: {
  order_number: string;
  delivery_fee: number;
}): string

// Sent by M-Pesa callback on successful payment (replaces payment confirmation when delivery_fee > 0)
export function formatDeliveryReceiptMessage(order: {
  order_number: string;
  mpesa_receipt_number: string;
  total: number;
  delivery_fee: number;
}): string
```

Message content per requirements:
- **Delivery inquiry**: `"Please share your specific location so we can calculate the delivery fee."` + order number
- **Payment request notification**: `"Delivery fee confirmed at KES [fee]. We are now sending a payment prompt to your phone."`
- **Delivery receipt**: `"Payment Received! Total: KES [total] (includes KES [fee] for delivery). Your order is now being dispatched."`

### 5. `website/src/app/api/orders/route.ts` — Order Creation Changes

Two changes:
1. Set `status: "pending_delivery_confirmation"` instead of `"pending"`.
2. After creating order items, fire-and-forget a `formatDeliveryInquiryMessage` in addition to the existing `formatOrderConfirmationMessage`.

```typescript
// Both are fire-and-forget
sendMessage(data.customer_phone, formatOrderConfirmationMessage({...}))
  .catch((e) => console.error("[Orders API] WhatsApp order confirmation failed:", e));

sendMessage(data.customer_phone, formatDeliveryInquiryMessage({
  order_number: order.order_number,
})).catch((e) => console.error("[Orders API] WhatsApp delivery inquiry failed:", e));
```

### 6. `website/src/app/api/admin/orders/[id]/stk-push/route.ts` — STK Push API Changes

Four additions to the existing route:

1. **Status check (step 3.5)**: After fetching the order, check if `order.status !== "pending_delivery_confirmation"`. If so, return HTTP 409 with `ORDER_NOT_READY`.
2. **Status transition (step 7)**: Before initiating the STK Push, update `order.status` to `"pending"`.
3. **Audit log (step 8)**: After successful STK Push, insert into `order_audit_logs`.
4. **WhatsApp notification (step 9)**: After successful STK Push, fire-and-forget `formatPaymentRequestNotificationMessage`.

The route also needs to fetch `session.userId` and `session.displayName` for the audit log. The `requireAdminSession` function returns a session object — check its shape and extract the user ID.

```typescript
// New step: status guard
if (order.status !== "pending_delivery_confirmation") {
  return err("Order is not awaiting delivery confirmation", "ORDER_NOT_READY", 409);
}

// New step: transition status
await admin.from("orders").update({ status: "pending" }).eq("id", order.id);

// New step: audit log (after successful STK push)
await admin.from("order_audit_logs").insert({
  order_id: order.id,
  event_type: "delivery_fee_authorized",
  delivery_fee,
  authorized_by_id: session.userId,
  authorized_by_name: session.displayName ?? "Admin",
});

// New step: WhatsApp notification (fire-and-forget)
sendMessage(order.customer_phone, formatPaymentRequestNotificationMessage({
  order_number: order.order_number,
  delivery_fee,
})).catch((e) => console.error("[STK Push] WhatsApp notification failed:", e));
```

### 7. `website/src/app/api/payments/mpesa/callback/route.ts` — Callback Changes

On successful payment (`ResultCode === 0`), fetch the order's `delivery_fee` field. If `delivery_fee > 0`, send `formatDeliveryReceiptMessage` instead of `formatPaymentConfirmationMessage`.

```typescript
// Fetch full order including delivery_fee
const { data: fullOrder } = await supabase
  .from("orders")
  .select("order_number, total, delivery_fee, customer_phone, mpesa_receipt_number")
  .eq("id", order.id)
  .single();

if (fullOrder) {
  const message = fullOrder.delivery_fee > 0
    ? formatDeliveryReceiptMessage({
        order_number: fullOrder.order_number,
        mpesa_receipt_number: String(receiptNumber || ""),
        total: fullOrder.total,
        delivery_fee: fullOrder.delivery_fee,
      })
    : formatPaymentConfirmationMessage({
        order_number: fullOrder.order_number,
        mpesa_receipt_number: String(receiptNumber || ""),
        total: fullOrder.total,
      });

  sendMessage(fullOrder.customer_phone, message)
    .catch((e) => console.error("[Callback] WhatsApp send failed:", e));
}
```

### 8. `website/src/app/api/webhooks/wasender/route.ts` — New Inbound Webhook

New Next.js API route that receives inbound WhatsApp message events from WaSender.

```typescript
// POST /api/webhooks/wasender
export async function POST(request: Request): Promise<Response>
```

**Request payload shape** (from WaSender):
```typescript
interface WaSenderInboundPayload {
  phone: string;      // sender's phone number
  message: string;    // message body
  // other fields ignored
}
```

**Logic**:
1. Parse body; validate `phone` and `message` are non-empty strings → 400 if invalid.
2. Query `orders` for an order with `customer_phone = phone` AND `status = "pending_delivery_confirmation"`.
3. If found: call `createNotification("delivery_negotiation_message", ...)` with order ID, order number, and message truncated to 100 chars.
4. If not found: log and return 200.
5. Always return 200 (to prevent WaSender retries).

### 9. `website/src/app/admin/(protected)/orders/[id]/page.tsx` — Admin Page Changes

Three additions:

1. **Status banner**: When `order.status === "pending_delivery_confirmation"`, render a prominent amber/yellow banner above the progress section indicating the order is awaiting delivery fee confirmation.
2. **Updated STEPS**: The progress bar `STEPS` array and `currentStepIndex` logic must handle `"pending_delivery_confirmation"` gracefully — it should not appear as a step, and `currentStepIndex` should be `-1` or `0` (same as the pre-pending state).
3. **Audit log section**: Fetch `order_audit_logs` for the order and render the `AuditLogPanel` component in the right column.

```typescript
// Fetch audit log alongside order
const [{ data: order }, { data: profile }, { data: auditLogs }] = await Promise.all([
  admin.from("orders").select("...").eq("id", id).single(),
  admin.from("profiles").select("role").eq("id", user!.id).single(),
  admin.from("order_audit_logs").select("*").eq("order_id", id).order("created_at", { ascending: false }),
]);
```

Pass `auditLogs` to `<AuditLogPanel entries={auditLogs ?? []} />`.

### 10. `website/src/app/admin/(protected)/orders/[id]/AdminSTKPushPanel.tsx` — Panel Changes

Two additions:

1. **Status-aware note**: Accept `orderStatus: OrderStatus` as a prop. When `orderStatus === "pending_delivery_confirmation"`, render an informational note: "Submitting this will transition the order to active processing."
2. **No-reset on error**: The existing `handleSubmit` already does not reset `deliveryFee` on error (it only resets on success). Verify this is correct and add a comment.

```typescript
interface Props {
  orderId: string
  orderNumber: string
  subtotal: number
  orderStatus: OrderStatus   // NEW
}
```

### 11. `website/src/app/admin/(protected)/orders/[id]/AuditLogPanel.tsx` — New Component

New client component displaying the audit trail for a given order.

```typescript
interface AuditLogEntry {
  id: string;
  order_id: string;
  event_type: string;
  delivery_fee: number;
  authorized_by_id: string;
  authorized_by_name: string;
  created_at: string;
}

interface Props {
  entries: AuditLogEntry[];
}

export function AuditLogPanel({ entries }: Props)
```

Renders:
- If `entries.length === 0`: "No delivery fee authorization on record" placeholder.
- Otherwise: a list of entries showing delivery fee amount (KES), authorizing admin name, and formatted timestamp.

---

## Data Models

### `orders` table — Status Constraint Extension

The `status` CHECK constraint is extended to include `"pending_delivery_confirmation"`:

```sql
CHECK (status IN (
  'pending_delivery_confirmation',
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'dispatched',
  'delivered',
  'cancelled'
))
```

### `order_audit_logs` table — New

```sql
CREATE TABLE public.order_audit_logs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type        text        NOT NULL,
  delivery_fee      integer     NOT NULL,
  authorized_by_id  uuid        NOT NULL REFERENCES public.profiles(id),
  authorized_by_name text       NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

Indexes:
- `idx_order_audit_logs_order` on `order_id`
- `idx_order_audit_logs_created` on `created_at DESC`

RLS:
- Admins can read and insert (service role for API writes).

### TypeScript Types

```typescript
// New type for audit log entries (used by AuditLogPanel)
export interface OrderAuditLogEntry {
  id: string;
  order_id: string;
  event_type: string;
  delivery_fee: number;
  authorized_by_id: string;
  authorized_by_name: string;
  created_at: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: New orders always start in pending_delivery_confirmation

*For any* valid order creation payload (any customer name, phone, items, delivery type, city), the order created by the Orders_API SHALL have `status = "pending_delivery_confirmation"`.

**Validates: Requirements 1.1**

---

### Property 2: STK Push is blocked for pending_delivery_confirmation orders

*For any* order with `status = "pending_delivery_confirmation"`, calling the Admin_STK_Push_API SHALL return HTTP 409 with error code `ORDER_NOT_READY`.

**Validates: Requirements 1.3**

---

### Property 3: Status transitions from pending_delivery_confirmation are restricted

*For any* `OrderStatus` value that is not `"pending"` and not `"cancelled"`, `isValidStatusTransition("pending_delivery_confirmation", status)` SHALL return `false`. For `"pending"` and `"cancelled"`, it SHALL return `true`.

**Validates: Requirements 1.6**

---

### Property 4: Delivery inquiry message always contains order number and location prompt

*For any* order number string, `formatDeliveryInquiryMessage({ order_number })` SHALL return a string that contains the order number and the phrase "share your specific location".

**Validates: Requirements 2.2**

---

### Property 5: WhatsApp failure does not fail order creation

*For any* valid order payload, if the WaSender service returns an error for any `sendMessage` call, the Orders_API SHALL still return a successful (2xx) response with the created order data.

**Validates: Requirements 2.4**

---

### Property 6: Inbound webhook always returns HTTP 200 for valid payloads

*For any* inbound webhook payload with non-empty `phone` and `message` fields, the webhook handler SHALL return HTTP 200 regardless of whether a matching order is found.

**Validates: Requirements 3.5**

---

### Property 7: Inbound webhook returns HTTP 400 for invalid payloads

*For any* inbound webhook payload where `phone` is missing/empty OR `message` is missing/empty, the webhook handler SHALL return HTTP 400.

**Validates: Requirements 3.6**

---

### Property 8: Notification message body is always truncated to 100 characters

*For any* inbound message body string of arbitrary length, the notification created by the webhook handler SHALL have a message preview of at most 100 characters.

**Validates: Requirements 3.3**

---

### Property 9: Order total is always subtotal plus delivery fee

*For any* non-negative integer subtotal and non-negative integer delivery fee, the Order_Total computed by the Admin_STK_Push_API SHALL equal `subtotal + delivery_fee`.

**Validates: Requirements 5.3, 7.1**

---

### Property 10: Payment request notification message always contains fee amount

*For any* delivery fee amount, `formatPaymentRequestNotificationMessage({ order_number, delivery_fee })` SHALL return a string that contains the delivery fee value and the phrase "payment prompt".

**Validates: Requirements 5.5**

---

### Property 11: Delivery receipt message always contains all required fields

*For any* order number, M-Pesa receipt number, total, and delivery fee, `formatDeliveryReceiptMessage({ order_number, mpesa_receipt_number, total, delivery_fee })` SHALL return a string that contains all four values and the phrase "being dispatched".

**Validates: Requirements 8.2, 8.3**

---

### Property 12: Delivery receipt replaces payment confirmation iff delivery fee is non-zero

*For any* successful M-Pesa callback, if the order's `delivery_fee > 0` then the WaSender SHALL be called with `formatDeliveryReceiptMessage`; if `delivery_fee === 0` then the WaSender SHALL be called with `formatPaymentConfirmationMessage`.

**Validates: Requirements 8.5**

---

### Property 13: Input field is not reset on STK Push API error

*For any* delivery fee value entered in the AdminSTKPushPanel, if the Admin_STK_Push_API returns an error response, the delivery fee input field value SHALL remain unchanged.

**Validates: Requirements 5.10**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| WaSender fails on delivery inquiry | Log error server-side; order creation succeeds |
| WaSender fails on payment request notification | Log error; STK Push still initiated; audit log still written |
| WaSender fails on delivery receipt | Log error; M-Pesa callback returns 200; order status updated |
| STK Push attempted on non-`pending_delivery_confirmation` order | HTTP 409 `ORDER_NOT_READY` |
| STK Push amount ≤ 0 | HTTP 422 `VALIDATION_ERROR` |
| Inbound webhook missing `phone` or `message` | HTTP 400 |
| Inbound webhook phone matches no pending order | HTTP 200, no notification created |
| Audit log insert fails | Log error; do not block STK Push response (best-effort) |
| `order_audit_logs` query fails on admin page | Render `AuditLogPanel` with empty entries; do not crash page |

---

## Testing Strategy

### Unit Tests

Focus on pure functions and isolated logic:

- `formatDeliveryInquiryMessage` — correct content for various order numbers
- `formatPaymentRequestNotificationMessage` — correct content for various fee amounts
- `formatDeliveryReceiptMessage` — correct content for various totals/fees
- `isValidStatusTransition` with `"pending_delivery_confirmation"` as source — all target statuses
- `AdminSTKPushPanel` — validation logic (empty, negative, non-numeric inputs); error state does not reset input
- `AuditLogPanel` — renders entries correctly; renders placeholder when empty

### Property-Based Tests

Use a property-based testing library (e.g., **fast-check** for TypeScript/Jest) with a minimum of 100 iterations per property.

Each test is tagged with: `Feature: whatsapp-delivery-negotiation, Property N: <property_text>`

- **Property 1**: Generate random valid order payloads → verify `status === "pending_delivery_confirmation"`
- **Property 2**: Generate random orders with `pending_delivery_confirmation` status → verify STK Push returns 409
- **Property 3**: Generate all `OrderStatus` values → verify `isValidStatusTransition("pending_delivery_confirmation", status)` returns correct boolean
- **Property 4**: Generate random order number strings → verify `formatDeliveryInquiryMessage` output contains order number and location prompt
- **Property 5**: Generate random valid orders with WaSender mocked to fail → verify Orders_API returns 2xx
- **Property 6**: Generate random valid webhook payloads → verify response is 200
- **Property 7**: Generate random payloads with missing/empty `phone` or `message` → verify response is 400
- **Property 8**: Generate random message strings of varying lengths → verify notification preview ≤ 100 chars
- **Property 9**: Generate random non-negative integer pairs (subtotal, delivery_fee) → verify total = subtotal + delivery_fee
- **Property 10**: Generate random delivery fee amounts → verify `formatPaymentRequestNotificationMessage` contains fee and "payment prompt"
- **Property 11**: Generate random (order_number, receipt, total, delivery_fee) tuples → verify `formatDeliveryReceiptMessage` contains all values and "dispatched"
- **Property 12**: Generate random successful callbacks with varying delivery_fee values → verify correct message formatter is called
- **Property 13**: Generate random delivery fee inputs with API error responses → verify input field value unchanged

### Integration Tests

- Full order creation flow: order created with `pending_delivery_confirmation`, both WhatsApp messages attempted
- Full STK Push flow: status transition, audit log, WhatsApp notification, M-Pesa initiation
- Full payment callback flow: delivery receipt sent for non-zero fee, payment confirmation sent for zero fee
- Webhook handler: notification created for matching order; no notification for unmatched phone
- Admin order detail page: renders status banner, audit log panel, and WhatsApp panel for `pending_delivery_confirmation` orders
