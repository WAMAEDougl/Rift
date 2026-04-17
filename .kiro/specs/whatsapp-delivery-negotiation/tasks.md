# Tasks — WhatsApp Delivery Negotiation

## Task List

- [x] 1. Database migration
  - [x] 1.1 Create migration file `website/supabase/migrations/003_delivery_negotiation.sql` that extends the `orders.status` CHECK constraint to include `'pending_delivery_confirmation'` and creates the `order_audit_logs` table with all fields, indexes, RLS policies, and the `ON DELETE CASCADE` foreign key constraint as specified in Requirements 6.1 and 10.1–10.4

- [x] 2. Type system extensions
  - [x] 2.1 Add `"pending_delivery_confirmation"` to the `OrderStatus` union type in `website/src/lib/admin/types.ts` (Requirement 1.2)
  - [x] 2.2 Add `"delivery_negotiation_message"` to the `NotificationType` union type in `website/src/lib/admin/types.ts` (Requirement 9.1)
  - [x] 2.3 Add `OrderAuditLogEntry` interface to `website/src/lib/admin/types.ts` with fields: `id`, `order_id`, `event_type`, `delivery_fee`, `authorized_by_id`, `authorized_by_name`, `created_at`
  - [x] 2.4 Sync the local `NotificationType` union in `website/src/lib/admin/notifications.ts` to include `"delivery_negotiation_message"` (Requirement 9.1)

- [x] 3. Status transition logic
  - [x] 3.1 Update `isValidStatusTransition` in `website/src/lib/admin/status.ts` to handle `"pending_delivery_confirmation"` as a non-terminal holding state: allow transitions to `"pending"` and `"cancelled"` only; block all other transitions (Requirement 1.6)

- [x] 4. WaSender message formatters
  - [x] 4.1 Add `formatDeliveryInquiryMessage(order: { order_number: string }): string` to `website/src/lib/wasender.ts` — message must contain the order number and the text "Please share your specific location so we can calculate the delivery fee." (Requirement 2.2)
  - [x] 4.2 Add `formatPaymentRequestNotificationMessage(order: { order_number: string; delivery_fee: number }): string` to `website/src/lib/wasender.ts` — message must contain the delivery fee and the text "We are now sending a payment prompt to your phone." (Requirement 5.5)
  - [x] 4.3 Add `formatDeliveryReceiptMessage(order: { order_number: string; mpesa_receipt_number: string; total: number; delivery_fee: number }): string` to `website/src/lib/wasender.ts` — message must match the format: "Payment Received! Total: KES [total] (includes KES [delivery_fee] for delivery). Your order is now being dispatched." (Requirement 8.3)

- [x] 5. Orders API — initial status and delivery inquiry message
  - [x] 5.1 Change the `status` field in the `orders` insert in `website/src/app/api/orders/route.ts` from `"pending"` to `"pending_delivery_confirmation"` (Requirement 1.1)
  - [x] 5.2 Add a fire-and-forget call to `sendMessage` with `formatDeliveryInquiryMessage` immediately after the existing order confirmation message dispatch in `website/src/app/api/orders/route.ts`; import `formatDeliveryInquiryMessage` from `@/lib/wasender` (Requirements 2.1, 2.3, 2.4, 2.5)

- [x] 6. Admin STK Push API — status guard, transition, audit log, and WhatsApp notification
  - [x] 6.1 After fetching the order in `website/src/app/api/admin/orders/[id]/stk-push/route.ts`, add a status check: if `order.status !== "pending_delivery_confirmation"`, return HTTP 409 with error code `ORDER_NOT_READY` (Requirement 1.3)
  - [x] 6.2 Before initiating the STK Push, update `order.status` to `"pending"` in Supabase (Requirement 1.4)
  - [x] 6.3 After a successful STK Push, insert an `order_audit_logs` record with `event_type: "delivery_fee_authorized"`, the negotiated `delivery_fee`, and the authenticated admin's user ID and display name extracted from the session (Requirements 5.6, 6.2)
  - [x] 6.4 After a successful STK Push, fire-and-forget `sendMessage` with `formatPaymentRequestNotificationMessage` to the customer's phone; import the new formatter from `@/lib/wasender` (Requirements 5.4, 5.5)
  - [x] 6.5 Fetch `order.customer_phone` and `order.order_number` in the order select query (needed for the WhatsApp notification in 6.4)

- [x] 7. M-Pesa callback — delivery receipt message
  - [x] 7.1 In `website/src/app/api/payments/mpesa/callback/route.ts`, extend the `fullOrder` select to include `delivery_fee` (Requirement 8.5)
  - [x] 7.2 Replace the unconditional `formatPaymentConfirmationMessage` call with a conditional: if `fullOrder.delivery_fee > 0`, call `formatDeliveryReceiptMessage`; otherwise call `formatPaymentConfirmationMessage`; import `formatDeliveryReceiptMessage` from `@/lib/wasender` (Requirements 8.1, 8.5)

- [x] 8. Inbound WhatsApp webhook
  - [x] 8.1 Create `website/src/app/api/webhooks/wasender/route.ts` with a `POST` handler that: (a) parses the request body, (b) validates that `phone` and `message` are non-empty strings and returns HTTP 400 if not, (c) queries `orders` for a record with `customer_phone = phone` AND `status = "pending_delivery_confirmation"`, (d) if found, calls `createNotification("delivery_negotiation_message", ...)` with the order ID, order number, and message body truncated to 100 characters, (e) always returns HTTP 200 (Requirements 3.1–3.6, 9.2)

- [x] 9. Admin order detail page — status banner and audit log
  - [x] 9.1 In `website/src/app/admin/(protected)/orders/[id]/page.tsx`, add a parallel fetch for `order_audit_logs` records for the order alongside the existing queries (Requirement 6.3)
  - [x] 9.2 Add a status banner in the left column: when `order.status === "pending_delivery_confirmation"`, render a prominent amber banner with the text "Awaiting delivery fee confirmation" above the Order Progress section (Requirement 4.2)
  - [x] 9.3 Update the `STEPS` array and `currentStepIndex` logic to handle `"pending_delivery_confirmation"` gracefully — it should not appear as a step and should not cause an out-of-bounds index
  - [x] 9.4 Import and render `<AuditLogPanel entries={auditLogs ?? []} />` in the right column below the AdminSTKPushPanel (Requirement 6.3, 6.4)
  - [x] 9.5 Pass `orderStatus={order.status}` as a new prop to `<AdminSTKPushPanel>` (needed for task 10.1)

- [x] 10. AdminSTKPushPanel — status-aware note and error behaviour
  - [x] 10.1 Add `orderStatus: OrderStatus` prop to `AdminSTKPushPanel` in `website/src/app/admin/(protected)/orders/[id]/AdminSTKPushPanel.tsx`; when `orderStatus === "pending_delivery_confirmation"`, render an informational note: "Submitting this will transition the order to active processing." (Requirement 5.11)
  - [x] 10.2 Verify and add a comment confirming that the `deliveryFee` input is NOT reset when the API returns an error (only reset on success); adjust if the current code resets it on error (Requirement 5.10)

- [x] 11. AuditLogPanel component
  - [x] 11.1 Create `website/src/app/admin/(protected)/orders/[id]/AuditLogPanel.tsx` as a client component that accepts `entries: OrderAuditLogEntry[]` and renders: a "No delivery fee authorization on record" placeholder when `entries` is empty; otherwise a list of entries showing the delivery fee (KES), the authorizing admin's name, and the formatted timestamp (Requirements 6.3, 6.4)

- [x] 12. Property-based tests
  - [x] 12.1 Write property-based tests for Property 4 (`formatDeliveryInquiryMessage` always contains order number and location prompt) using fast-check
  - [x] 12.2 Write property-based tests for Property 8 (notification message preview is always ≤ 100 characters) using fast-check
  - [x] 12.3 Write property-based tests for Property 9 (Order_Total = subtotal + delivery_fee for all non-negative integer pairs) using fast-check
  - [x] 12.4 Write property-based tests for Property 10 (`formatPaymentRequestNotificationMessage` always contains fee amount and "payment prompt") using fast-check
  - [x] 12.5 Write property-based tests for Property 11 (`formatDeliveryReceiptMessage` always contains all required fields and "dispatched") using fast-check
  - [x] 12.6 Write property-based tests for Property 3 (`isValidStatusTransition` from `"pending_delivery_confirmation"` — correct for all target statuses) using fast-check
  - [x] 12.7 Write property-based tests for Property 7 (webhook returns 400 for any payload missing/empty `phone` or `message`) using fast-check
  - [x] 12.8 Write property-based tests for Property 12 (delivery receipt vs payment confirmation message selection based on delivery_fee) using fast-check
