# Requirements Document

## Introduction

This feature extends the existing WhatsApp + M-Pesa integration on the Ayola Foods platform to support a structured delivery fee negotiation workflow. When an order is placed, the system automatically prompts the customer for their specific location via WhatsApp. The order is held in a new `PENDING_DELIVERY_CONFIRMATION` status until an admin reviews the conversation, agrees on a delivery fee with the customer, and triggers the STK Push from the admin portal — all without leaving the internal dashboard. The final payment amount is dynamically computed as the order subtotal plus the negotiated delivery fee. An audit trail records who authorized the fee, and a final WhatsApp receipt is sent once payment is confirmed.

This builds on top of the already-implemented WaSender service module (`website/src/lib/wasender.ts`), the `WhatsAppPanel` and `AdminSTKPushPanel` components, and the admin STK Push API route (`/api/admin/orders/[id]/stk-push`).

## Glossary

- **Orders_API**: The Next.js API route at `website/src/app/api/orders/route.ts` responsible for creating and persisting orders in Supabase.
- **WaSender_Service**: The server-side module at `website/src/lib/wasender.ts` that wraps the WaSender REST API to send and retrieve WhatsApp messages.
- **Admin_Order_Detail_Page**: The Next.js admin page at `website/src/app/admin/(protected)/orders/[id]/page.tsx` where admins view and manage individual orders.
- **Admin_STK_Push_API**: The API route at `website/src/app/api/admin/orders/[id]/stk-push/route.ts` that computes the final charge and triggers the M-Pesa STK Push.
- **AdminSTKPushPanel**: The client component at `website/src/app/admin/(protected)/orders/[id]/AdminSTKPushPanel.tsx` that renders the delivery fee input and "Send STK Push" button.
- **WhatsAppPanel**: The client component at `website/src/app/admin/(protected)/orders/[id]/WhatsAppPanel.tsx` that displays the live WhatsApp conversation thread and reply input.
- **MPesa_Callback_Handler**: The webhook handler at `website/src/app/api/payments/mpesa/callback/route.ts` that processes M-Pesa payment confirmations.
- **Notification_Service**: The existing admin notification mechanism (`createNotification`) used to alert admin users of relevant order events.
- **PENDING_DELIVERY_CONFIRMATION**: A new order status value indicating the order is awaiting delivery fee agreement before payment can be requested.
- **Order_Subtotal**: The sum of all order item line totals, excluding any delivery fee.
- **Negotiated_Delivery_Fee**: The delivery fee amount agreed upon between the admin and the customer via WhatsApp, entered by the admin in the AdminSTKPushPanel.
- **Order_Total**: The final amount charged to the customer, equal to Order_Subtotal plus the Negotiated_Delivery_Fee.
- **STK_Push**: A Safaricom M-Pesa payment prompt sent to a customer's phone requesting PIN entry to complete a payment.
- **Delivery_Inquiry_Message**: The automated WhatsApp message sent to the customer immediately after order creation asking for their specific location.
- **Payment_Request_Notification_Message**: The WhatsApp message sent to the customer by the admin when triggering the STK Push, confirming the agreed delivery fee and informing them a payment prompt is being sent.
- **Delivery_Receipt_Message**: The automated WhatsApp message sent to the customer after M-Pesa payment is confirmed, summarising the total paid including the delivery fee.
- **Audit_Log_Entry**: A record in the `order_audit_logs` Supabase table capturing the agreed delivery fee, the admin user who authorized it, and a timestamp.
- **Admin_User**: An authenticated user with the `admin` role in the `profiles` table.
- **OrderStatus**: The TypeScript union type defined in `website/src/lib/admin/types.ts` representing all valid order status values.

---

## Requirements

### Requirement 1: PENDING_DELIVERY_CONFIRMATION Order Status

**User Story:** As an admin, I want new orders to be held in a dedicated status until a delivery fee is agreed upon, so that no payment is requested before the correct total is known.

#### Acceptance Criteria

1. THE Orders_API SHALL set the initial `status` of every newly created order to `PENDING_DELIVERY_CONFIRMATION`.
2. THE OrderStatus type in `website/src/lib/admin/types.ts` SHALL include `"pending_delivery_confirmation"` as a valid value.
3. WHILE an order has status `PENDING_DELIVERY_CONFIRMATION`, THE Admin_STK_Push_API SHALL reject any STK Push request with HTTP 409 and error code `ORDER_NOT_READY`.
4. WHEN an admin submits a valid Negotiated_Delivery_Fee via the AdminSTKPushPanel, THE Admin_STK_Push_API SHALL transition the order status from `PENDING_DELIVERY_CONFIRMATION` to `"pending"` before initiating the STK Push.
5. THE `ORDER_STATUS_SEQUENCE` array in `website/src/lib/admin/types.ts` SHALL NOT include `"pending_delivery_confirmation"`, as it is a pre-flow holding state rather than a progression step.
6. THE `isValidStatusTransition` function in `website/src/lib/admin/status.ts` SHALL treat `"pending_delivery_confirmation"` as a non-terminal state that can be transitioned to `"pending"` or `"cancelled"` only.

---

### Requirement 2: Automated Delivery Inquiry WhatsApp Message

**User Story:** As a customer, I want to receive a WhatsApp message immediately after placing an order asking for my specific location, so that the admin can calculate the correct delivery fee.

#### Acceptance Criteria

1. WHEN the Orders_API successfully creates an order and its order items in Supabase, THE Orders_API SHALL invoke the WaSender_Service to send a Delivery_Inquiry_Message to the customer's `customer_phone` number.
2. THE Delivery_Inquiry_Message SHALL contain the order number and the text: "Please share your specific location so we can calculate the delivery fee."
3. THE Delivery_Inquiry_Message SHALL be sent in addition to the existing Order_Confirmation_Message; both messages SHALL be dispatched as fire-and-forget operations.
4. IF the WaSender_Service returns an error when sending the Delivery_Inquiry_Message, THEN THE Orders_API SHALL log the error server-side and return a successful order creation response to the client; the WhatsApp failure SHALL NOT cause the order creation to fail.
5. THE Orders_API SHALL NOT delay the HTTP response to the client while waiting for the Delivery_Inquiry_Message to be sent.

---

### Requirement 3: Admin Notification for Delivery Negotiation Messages

**User Story:** As an admin, I want to be alerted when a customer replies to the delivery inquiry, so that I can respond promptly and agree on a fee without monitoring WhatsApp manually.

#### Acceptance Criteria

1. THE WaSender_Service SHALL expose a webhook handler endpoint at `POST /api/webhooks/wasender` that receives inbound WhatsApp message events from the WaSender API.
2. WHEN the webhook receives an inbound message for a phone number that matches the `customer_phone` of an order with status `PENDING_DELIVERY_CONFIRMATION`, THE webhook handler SHALL invoke the Notification_Service to create an admin notification of type `"delivery_negotiation_message"`.
3. THE admin notification SHALL include the order ID, the order number, and a summary of the inbound message body (truncated to 100 characters).
4. IF no order with status `PENDING_DELIVERY_CONFIRMATION` is found for the inbound message's phone number, THEN THE webhook handler SHALL log the event and return HTTP 200 without creating a notification.
5. THE webhook handler SHALL return HTTP 200 for all inbound events regardless of whether a notification was created, to prevent WaSender from retrying the delivery.
6. THE webhook handler SHALL validate that the inbound payload contains a non-empty `phone` field and a non-empty `message` field; IF either is missing, THEN THE webhook handler SHALL return HTTP 400.

---

### Requirement 4: Admin Portal Live WhatsApp Thread

**User Story:** As an admin, I want to view and respond to the customer's WhatsApp conversation directly from the order detail page, so that I can negotiate the delivery fee without switching to a separate device or application.

#### Acceptance Criteria

1. THE Admin_Order_Detail_Page SHALL display the WhatsAppPanel for all orders, including those with status `PENDING_DELIVERY_CONFIRMATION`.
2. WHEN an order has status `PENDING_DELIVERY_CONFIRMATION`, THE Admin_Order_Detail_Page SHALL display a prominent status banner indicating the order is awaiting delivery fee confirmation.
3. THE WhatsAppPanel SHALL display the live conversation thread fetched server-side via the WaSender_Service, consistent with the existing implementation.
4. THE WhatsAppPanel SHALL allow the admin to send a reply message to the customer's WhatsApp number via the existing `POST /api/admin/whatsapp/send` route.
5. IF the WaSender_Service returns an error when fetching message history, THEN THE WhatsAppPanel SHALL display an error notice without preventing the rest of the Admin_Order_Detail_Page from rendering.

---

### Requirement 5: Admin Delivery Fee Input and Payment Request Trigger

**User Story:** As an admin, I want to enter the agreed delivery fee and trigger the STK Push from the order detail page, so that the customer is charged the correct negotiated total.

#### Acceptance Criteria

1. THE AdminSTKPushPanel SHALL display a "Request Payment" button labelled "Send STK Push" that is enabled only when a valid Negotiated_Delivery_Fee has been entered.
2. WHEN an admin enters a Negotiated_Delivery_Fee and clicks "Send STK Push", THE AdminSTKPushPanel SHALL send a request to the Admin_STK_Push_API with the order ID and the Negotiated_Delivery_Fee.
3. THE Admin_STK_Push_API SHALL compute the Order_Total as Order_Subtotal plus the Negotiated_Delivery_Fee.
4. WHEN the Admin_STK_Push_API successfully initiates the STK Push, THE Admin_STK_Push_API SHALL send a Payment_Request_Notification_Message to the customer's WhatsApp number via the WaSender_Service.
5. THE Payment_Request_Notification_Message SHALL contain the text: "Delivery fee confirmed at KES [Negotiated_Delivery_Fee]. We are now sending a payment prompt to your phone."
6. WHEN the Admin_STK_Push_API successfully initiates the STK Push, THE Admin_STK_Push_API SHALL record an Audit_Log_Entry in the `order_audit_logs` table containing: the order ID, the Negotiated_Delivery_Fee, the Admin_User's ID and display name, and the timestamp.
7. IF the Negotiated_Delivery_Fee input is empty or contains a non-numeric value, THEN THE AdminSTKPushPanel SHALL display a validation error and prevent the STK Push request from being sent.
8. IF the Negotiated_Delivery_Fee is a negative number, THEN THE AdminSTKPushPanel SHALL display a validation error and prevent the STK Push request from being sent.
9. WHEN the Admin_STK_Push_API successfully initiates the STK Push, THE AdminSTKPushPanel SHALL display a success notice indicating the prompt has been sent to the customer's phone.
10. IF the Admin_STK_Push_API returns an error, THEN THE AdminSTKPushPanel SHALL display the error message without resetting the delivery fee input field.
11. WHILE an order has status `PENDING_DELIVERY_CONFIRMATION`, THE AdminSTKPushPanel SHALL display an informational note indicating that the STK Push will transition the order to active processing.

---

### Requirement 6: Audit Trail for Negotiated Delivery Fee

**User Story:** As a business owner, I want a permanent record of who agreed to each delivery fee and when, so that I can audit charges and resolve disputes.

#### Acceptance Criteria

1. THE `order_audit_logs` Supabase table SHALL store records with the following fields: `id` (UUID, primary key), `order_id` (UUID, foreign key to `orders`), `event_type` (text), `delivery_fee` (integer), `authorized_by_id` (UUID, foreign key to `profiles`), `authorized_by_name` (text), `created_at` (timestamptz, default now()).
2. WHEN the Admin_STK_Push_API initiates an STK Push, THE Admin_STK_Push_API SHALL insert an Audit_Log_Entry with `event_type` equal to `"delivery_fee_authorized"`.
3. THE Admin_Order_Detail_Page SHALL display the Audit_Log_Entry for the order in the order detail view, showing the delivery fee amount, the authorizing admin's name, and the timestamp.
4. IF no Audit_Log_Entry exists for an order, THEN THE Admin_Order_Detail_Page SHALL display a "No delivery fee authorization on record" placeholder in the audit section.
5. THE `order_audit_logs` table SHALL enforce a foreign key constraint on `order_id` referencing the `orders` table with `ON DELETE CASCADE`.

---

### Requirement 7: Dynamic STK Push with Negotiated Total

**User Story:** As a customer, I want the M-Pesa payment prompt to reflect the total including the agreed delivery fee, so that I pay the correct amount in a single transaction.

#### Acceptance Criteria

1. THE Admin_STK_Push_API SHALL compute the STK Push amount as Order_Subtotal plus the Negotiated_Delivery_Fee provided by the admin.
2. WHEN the Admin_STK_Push_API initiates the STK Push, THE Admin_STK_Push_API SHALL update the order's `delivery_fee` field to the Negotiated_Delivery_Fee and the `total` field to the computed Order_Total in Supabase.
3. THE Admin_STK_Push_API SHALL pass the computed Order_Total as the `amount` parameter to the existing STK Push service without modification.
4. IF the computed Order_Total is not a positive integer, THEN THE Admin_STK_Push_API SHALL return HTTP 422 with error code `VALIDATION_ERROR` and SHALL NOT initiate the STK Push.
5. THE existing customer-facing STK Push flow (initiated from the checkout page via `/api/payments/mpesa/initiate`) SHALL remain unchanged.

---

### Requirement 8: Delivery Receipt WhatsApp Message on Payment Confirmation

**User Story:** As a customer, I want to receive a WhatsApp message after my payment is confirmed that shows the full breakdown including the delivery fee, so that I have a clear receipt.

#### Acceptance Criteria

1. WHEN the MPesa_Callback_Handler receives a callback with `ResultCode` equal to `0` (payment successful) and successfully updates the order status, THE MPesa_Callback_Handler SHALL invoke the WaSender_Service to send a Delivery_Receipt_Message to the order's `customer_phone`.
2. THE Delivery_Receipt_Message SHALL include: the order number, the M-Pesa receipt number, the Order_Total, the Negotiated_Delivery_Fee (labelled as "delivery"), and a confirmation that the order is now being dispatched.
3. THE Delivery_Receipt_Message SHALL use the text: "Payment Received! Total: KES [Order_Total] (includes KES [Negotiated_Delivery_Fee] for delivery). Your order is now being dispatched."
4. IF the WaSender_Service returns an error when sending the Delivery_Receipt_Message, THEN THE MPesa_Callback_Handler SHALL log the error and continue; the WhatsApp failure SHALL NOT affect the M-Pesa callback response or the order status update.
5. THE Delivery_Receipt_Message SHALL replace the existing Payment_Confirmation_Message for orders that have a non-zero Negotiated_Delivery_Fee; orders with a zero delivery fee SHALL continue to receive the existing Payment_Confirmation_Message.

---

### Requirement 9: Notification Type Extension

**User Story:** As a developer, I want the notification type system to support the new delivery negotiation event, so that admin alerts are correctly categorised and can be filtered in the UI.

#### Acceptance Criteria

1. THE `NotificationType` union type in `website/src/lib/admin/types.ts` SHALL include `"delivery_negotiation_message"` as a valid value.
2. WHEN a `"delivery_negotiation_message"` notification is created, THE Notification_Service SHALL store the order ID and a truncated message preview in the notification's metadata field.
3. THE admin notifications panel SHALL display `"delivery_negotiation_message"` notifications with a distinct label: "Customer replied to delivery inquiry".

---

### Requirement 10: Database Migration

**User Story:** As a developer, I want the required schema changes to be captured in a versioned migration file, so that the database can be updated consistently across environments.

#### Acceptance Criteria

1. THE migration file SHALL add `"pending_delivery_confirmation"` to the `orders.status` column enum (or check constraint) in Supabase.
2. THE migration file SHALL create the `order_audit_logs` table with the schema defined in Requirement 6.1.
3. THE migration file SHALL be placed at `website/supabase/migrations/` with a timestamped filename following the existing convention.
4. IF the migration is applied to a database that already contains orders with status `"pending"`, THEN the existing orders SHALL be unaffected.
