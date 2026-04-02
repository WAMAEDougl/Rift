# Requirements Document

## Introduction

The Admin API provides all server-side endpoints for the Ayola Foods KE admin panel. It is built on Next.js 16 Route Handlers (App Router), backed by Supabase (PostgreSQL) with Supabase Auth, validated with Zod, and written in TypeScript. The API covers authentication, dashboard analytics, order management, product and category CRUD, customer management, payment tracking, notifications, M-Pesa integration, and store settings. All admin routes are protected by a shared session guard that enforces role-based access (`admin` or `kitchen`).

---

## Glossary

- **Admin_API**: The collection of Next.js Route Handlers under `/api/admin/` and the customer-facing M-Pesa initiation endpoint.
- **Session_Guard**: The `requireAdminSession(request)` server-side helper that validates the Supabase session and checks the caller's role.
- **Service_Client**: The Supabase client initialised with the service role key, used to bypass Row Level Security on all admin routes.
- **Response_Envelope**: The standard JSON wrapper `{ data, error }` returned by every endpoint.
- **Pagination_Helper**: The shared utility that reads `page` / `per_page` query params and returns `{ items, pagination }` metadata.
- **Notification_Helper**: The internal `createNotification(type, title, message, orderId?)` server-side function that inserts rows into the `notifications` table.
- **Order**: A row in the `orders` table representing a customer purchase.
- **Profile**: A row in the `profiles` table linked to a Supabase Auth user, carrying the `role` field.
- **Product**: A row in the `products` table representing a sellable item.
- **Category**: A row in the `categories` table grouping products.
- **Payment_Log**: A row in the `payment_logs` table recording raw provider events.
- **Notification**: A row in the `notifications` table representing an admin-facing event alert.
- **Store_Settings**: The single-row `store_settings` table holding global configuration values.
- **STK_Push**: Safaricom M-Pesa Express payment prompt sent to a customer's phone.
- **Kitchen_Role**: A restricted admin role that may update order status but cannot mutate other resources.

---

## Requirements

### Requirement 1: Shared Infrastructure — Response Envelope

**User Story:** As a frontend developer, I want every API endpoint to return a consistent JSON shape, so that I can write a single response-handling utility without per-endpoint special cases.

#### Acceptance Criteria

1. THE Admin_API SHALL return `{ "data": <payload>, "error": null }` for every successful response.
2. THE Admin_API SHALL return `{ "data": null, "error": { "message": "...", "code": "ERROR_CODE" } }` for every error response.
3. THE Admin_API SHALL use HTTP status codes `401`, `403`, `404`, `409`, `422`, `500`, and `503` to match the error codes defined in the Glossary.


### Requirement 2: Shared Infrastructure — Session Guard

**User Story:** As a security engineer, I want every admin route to verify the caller's session and role before executing any logic, so that unauthenticated or unauthorised users cannot access admin data.

#### Acceptance Criteria

1. THE Session_Guard SHALL create a Supabase server client and call `supabase.auth.getUser()` on every request to `/api/admin/*`.
2. IF no valid session is present, THEN THE Session_Guard SHALL return `401 UNAUTHORIZED` with error code `UNAUTHORIZED`.
3. WHEN a valid session exists, THE Session_Guard SHALL fetch the caller's `profiles` row and verify `role IN ('admin', 'kitchen')`.
4. IF the caller's role is not `admin` or `kitchen`, THEN THE Session_Guard SHALL call `supabase.auth.signOut()` and return `403 FORBIDDEN` with error code `FORBIDDEN`.
5. THE Session_Guard SHALL return `{ user, profile }` to the calling route handler upon successful validation.
6. WHEN a route requires `admin`-only access and the caller's role is `kitchen`, THE Session_Guard SHALL return `403 FORBIDDEN` with error code `FORBIDDEN`.

---

### Requirement 3: Shared Infrastructure — Pagination

**User Story:** As a frontend developer, I want all list endpoints to support consistent pagination parameters, so that I can build a single reusable table component.

#### Acceptance Criteria

1. THE Pagination_Helper SHALL accept `page` (integer, default 1) and `per_page` (integer, default 20, max 100) as query parameters on all list endpoints.
2. THE Pagination_Helper SHALL include `{ page, per_page, total, total_pages }` metadata inside `data.pagination` on every paginated response.
3. IF `per_page` exceeds 100, THEN THE Pagination_Helper SHALL clamp the value to 100.

---

### Requirement 4: Shared Infrastructure — Service Role Client

**User Story:** As a backend developer, I want all admin routes to use the Supabase service role client, so that Row Level Security does not block legitimate admin operations.

#### Acceptance Criteria

1. THE Service_Client SHALL be initialised with `SUPABASE_SERVICE_ROLE_KEY` and never with the anon key on any admin route.
2. THE Admin_API SHALL never include the service role key in any HTTP response body or header.

---

### Requirement 5: Authentication — Login

**User Story:** As an admin or kitchen user, I want to sign in with my email and password, so that I can access the admin panel.

#### Acceptance Criteria

1. WHEN `POST /api/admin/auth/login` is called with a valid email and password of at least 8 characters, THE Admin_API SHALL call `supabase.auth.signInWithPassword` and return `200` with the user's `{ id, email, full_name, role }`.
2. IF Zod validation fails on the request body, THEN THE Admin_API SHALL return `422 VALIDATION_ERROR` without attempting authentication.
3. IF `supabase.auth.signInWithPassword` returns an error, THEN THE Admin_API SHALL return `401 UNAUTHORIZED` with the generic message `"Invalid email or password"` without revealing which field is incorrect.
4. WHEN authentication succeeds but the user's `profiles.role` is not `admin` or `kitchen`, THE Admin_API SHALL call `supabase.auth.signOut()` and return `403 FORBIDDEN` with message `"Access denied"`.


### Requirement 6: Authentication — Logout and Current User

**User Story:** As an admin user, I want to log out and retrieve my current session profile, so that the frontend shell can display my name and role.

#### Acceptance Criteria

1. WHEN `POST /api/admin/auth/logout` is called with a valid session, THE Admin_API SHALL call `supabase.auth.signOut()` and return `{ "data": { "success": true } }`.
2. WHEN `GET /api/admin/auth/me` is called with a valid session, THE Admin_API SHALL return the caller's `{ id, full_name, email, role }` from the `profiles` table.

---

### Requirement 7: Dashboard — Aggregate Stats

**User Story:** As an admin, I want to see total orders, revenue, pending orders, and customer count on the dashboard, so that I can monitor business health at a glance.

#### Acceptance Criteria

1. WHEN `GET /api/admin/dashboard/stats` is called, THE Admin_API SHALL return `{ total_orders, total_revenue_kes, pending_orders, total_customers }`.
2. THE Admin_API SHALL compute `total_revenue_kes` as the sum of `total` from `orders` where `payment_status = 'completed'`.
3. THE Admin_API SHALL compute `pending_orders` as the count of `orders` where `status IN ('pending', 'confirmed')`.
4. THE Admin_API SHALL compute `total_customers` as the count of `profiles` where `role = 'customer'`.
5. THE Admin_API SHALL execute all four aggregate queries in parallel.

---

### Requirement 8: Dashboard — Revenue Chart

**User Story:** As an admin, I want to see daily revenue for a configurable number of past days, so that I can identify sales trends.

#### Acceptance Criteria

1. WHEN `GET /api/admin/dashboard/revenue` is called, THE Admin_API SHALL return an array of `{ date, revenue_kes }` objects grouped by day.
2. THE Admin_API SHALL accept a `days` query parameter (integer, default 14, max 90) to control the lookback window.
3. THE Admin_API SHALL include only orders where `payment_status = 'completed'` in the revenue calculation.
4. IF `days` exceeds 90, THEN THE Admin_API SHALL clamp the value to 90.

---

### Requirement 9: Dashboard — Order Status Summary

**User Story:** As an admin, I want to see a count of orders per status, so that I can understand the current operational workload.

#### Acceptance Criteria

1. WHEN `GET /api/admin/dashboard/order-status-summary` is called, THE Admin_API SHALL return an array of `{ status, count }` objects covering all order statuses present in the database.

---

### Requirement 10: Orders — List

**User Story:** As an admin or kitchen user, I want to browse a paginated, filterable list of orders, so that I can find and act on specific orders quickly.

#### Acceptance Criteria

1. WHEN `GET /api/admin/orders` is called, THE Admin_API SHALL return a paginated list of orders with fields `{ id, order_number, customer_name, customer_phone, item_count, subtotal, delivery_fee, total, delivery_type, status, payment_method, payment_status, created_at }`.
2. THE Admin_API SHALL support filtering by `status`, `payment_status`, `delivery_type`, `from` (ISO date), `to` (ISO date), and free-text search `q` matching `order_number`, `customer_name`, or `customer_phone`.
3. THE Admin_API SHALL compute `item_count` from the count of related `order_items` rows.


### Requirement 11: Orders — Single Order Detail

**User Story:** As an admin or kitchen user, I want to view the full details of an order including its line items, so that I can prepare or verify the order.

#### Acceptance Criteria

1. WHEN `GET /api/admin/orders/[id]` is called with a valid order UUID, THE Admin_API SHALL return the full order object including all `order_items` rows with `{ id, product_id, product_name, product_price, quantity, line_total }`.
2. IF the order UUID does not exist, THEN THE Admin_API SHALL return `404 NOT_FOUND`.

---

### Requirement 12: Orders — Update Status

**User Story:** As an admin or kitchen user, I want to update an order's status, so that customers and staff can track fulfilment progress.

#### Acceptance Criteria

1. WHEN `PATCH /api/admin/orders/[id]/status` is called with a valid `status` value, THE Admin_API SHALL update the order and return the full updated order object.
2. THE Admin_API SHALL validate `status` against the enum `pending | confirmed | preparing | ready | dispatched | delivered | cancelled` using Zod.
3. THE Admin_API SHALL enforce forward-only status transitions and reject backward transitions with `409 CONFLICT`, except that `cancelled` is permitted from any non-terminal state.
4. WHEN `status` is set to `delivered`, THE Admin_API SHALL also set `completed_at = now()`.
5. WHEN `status` is set to `confirmed`, THE Admin_API SHALL also set `confirmed_at = now()`.
6. IF the order is already in a terminal state (`delivered` or `cancelled`), THEN THE Admin_API SHALL return `409 CONFLICT` with message `"Order is already [status] and cannot be updated."`.
7. WHILE the caller's role is `kitchen`, THE Admin_API SHALL reject a status value of `cancelled` with `403 FORBIDDEN`.

---

### Requirement 13: Orders — Cancel

**User Story:** As an admin, I want to cancel an order with an optional reason, so that I can handle customer requests or operational issues.

#### Acceptance Criteria

1. WHEN `POST /api/admin/orders/[id]/cancel` is called, THE Admin_API SHALL set `status = 'cancelled'` and append the optional `reason` to `order_notes`.
2. WHEN the cancelled order has `payment_status = 'completed'`, THE Admin_API SHALL set `payment_status = 'refunded'`.
3. THE Admin_API SHALL restrict `POST /api/admin/orders/[id]/cancel` to callers with `role = 'admin'`.

---

### Requirement 14: Orders — Bulk Status Update

**User Story:** As an admin, I want to update the status of multiple orders at once, so that I can efficiently process batches of orders.

#### Acceptance Criteria

1. WHEN `POST /api/admin/orders/bulk-status` is called with an array of order UUIDs and a target `status`, THE Admin_API SHALL apply the status update to each valid order and return `{ updated, skipped, skipped_ids }`.
2. THE Admin_API SHALL restrict `status` to `confirmed` or `cancelled` for bulk operations.
3. THE Admin_API SHALL reject requests with more than 50 IDs with `422 VALIDATION_ERROR`.
4. THE Admin_API SHALL silently skip orders already in a terminal state and include their IDs in `skipped_ids`.
5. THE Admin_API SHALL wrap all updates in a single database transaction.
6. THE Admin_API SHALL restrict this endpoint to callers with `role = 'admin'`.

---

### Requirement 15: Orders — Delete

**User Story:** As an admin, I want to permanently delete a cancelled order, so that I can clean up test or erroneous records.

#### Acceptance Criteria

1. WHEN `DELETE /api/admin/orders/[id]` is called on an order with `status = 'cancelled'`, THE Admin_API SHALL hard-delete the order and return `{ "deleted": true }`.
2. IF the order's `status` is not `cancelled`, THEN THE Admin_API SHALL return `409 CONFLICT`.
3. THE Admin_API SHALL restrict this endpoint to callers with `role = 'admin'`.


### Requirement 16: Products — List and Single

**User Story:** As an admin, I want to browse all products including inactive ones and view individual product details, so that I can manage the product catalogue.

#### Acceptance Criteria

1. WHEN `GET /api/admin/products` is called, THE Admin_API SHALL return a paginated list of all products (including inactive) with `category_name` joined from the `categories` table.
2. THE Admin_API SHALL support filtering by `q` (search name/slug), `category_id`, `in_stock` (boolean), and `is_active` (boolean).
3. WHEN `GET /api/admin/products/[id]` is called with a valid product UUID, THE Admin_API SHALL return the full product row.
4. IF the product UUID does not exist, THEN THE Admin_API SHALL return `404 NOT_FOUND`.

---

### Requirement 17: Products — Create

**User Story:** As an admin, I want to create new products, so that I can expand the menu.

#### Acceptance Criteria

1. WHEN `POST /api/admin/products` is called with a valid body, THE Admin_API SHALL insert the product and return `201 Created` with the new product row.
2. THE Admin_API SHALL validate the request body with Zod, requiring `name`, `slug` (URL-safe string), `category_id` (UUID), and `price` (integer ≥ 1).
3. IF a product with the same `slug` already exists, THEN THE Admin_API SHALL return `409 CONFLICT`.
4. THE Admin_API SHALL default `in_stock` to `true`, `is_active` to `true`, and `sort_order` to `0` when not provided.

---

### Requirement 18: Products — Update and Delete

**User Story:** As an admin, I want to fully replace, partially update, or delete products, so that I can keep the catalogue accurate.

#### Acceptance Criteria

1. WHEN `PUT /api/admin/products/[id]` is called with a complete product body, THE Admin_API SHALL replace all product fields and return the updated product.
2. WHEN `PATCH /api/admin/products/[id]` is called with a partial body, THE Admin_API SHALL update only the provided fields and return the updated product.
3. WHEN `DELETE /api/admin/products/[id]` is called and the product has no rows in `order_items`, THE Admin_API SHALL hard-delete the product and return `{ "deleted": true }`.
4. WHEN `DELETE /api/admin/products/[id]` is called and the product exists in at least one `order_items` row, THE Admin_API SHALL set `is_active = false` and return `{ "soft_deleted": true, "reason": "Product has order history. Deactivated instead." }`.
5. THE Admin_API SHALL restrict all product mutation endpoints to callers with `role = 'admin'`.

---

### Requirement 19: Categories — CRUD

**User Story:** As an admin, I want to create, read, update, and delete product categories, so that I can organise the menu.

#### Acceptance Criteria

1. WHEN `GET /api/admin/categories` is called, THE Admin_API SHALL return all categories ordered by `sort_order ASC`, each including a `product_count` derived from joining `products`.
2. WHEN `GET /api/admin/categories/[id]` is called with a valid UUID, THE Admin_API SHALL return the single category row.
3. WHEN `POST /api/admin/categories` is called with a valid body, THE Admin_API SHALL insert the category and return `201 Created`.
4. THE Admin_API SHALL validate `slug` as a required unique string and `name` as a required string; all other fields are optional.
5. WHEN `PUT /api/admin/categories/[id]` is called with a complete body, THE Admin_API SHALL replace all category fields and return the updated category.
6. WHEN `DELETE /api/admin/categories/[id]` is called and the category has at least one product, THE Admin_API SHALL return `409 CONFLICT` with message `"Category has products. Reassign or delete them first."`.
7. WHEN `DELETE /api/admin/categories/[id]` is called and the category has no products, THE Admin_API SHALL hard-delete the category and return `{ "deleted": true }`.
8. THE Admin_API SHALL restrict category mutation endpoints to callers with `role = 'admin'`.


### Requirement 20: Customers — List and Detail

**User Story:** As an admin, I want to browse customers and view their full order history and spending stats, so that I can understand customer behaviour and resolve issues.

#### Acceptance Criteria

1. WHEN `GET /api/admin/customers` is called, THE Admin_API SHALL return a paginated list of profiles, each including `order_count` and `total_spent` (sum of `total` for orders with `payment_status = 'completed'`).
2. THE Admin_API SHALL support filtering by `q` (search name/email/phone) and `role`.
3. WHEN `GET /api/admin/customers/[id]` is called with a valid profile UUID, THE Admin_API SHALL return `{ profile, orders, stats }` where `stats` includes `order_count`, `total_spent_kes`, `first_order_at`, and `last_order_at`.
4. THE Admin_API SHALL include up to 200 orders in the customer detail response without additional pagination.
5. IF the profile UUID does not exist, THEN THE Admin_API SHALL return `404 NOT_FOUND`.

---

### Requirement 21: Customers — Role Update

**User Story:** As an admin, I want to change a user's role, so that I can grant or revoke admin and kitchen access.

#### Acceptance Criteria

1. WHEN `PATCH /api/admin/customers/[id]/role` is called with a valid `role` value, THE Admin_API SHALL update the profile's role and return the updated profile.
2. THE Admin_API SHALL validate `role` against the enum `customer | kitchen | admin` using Zod.
3. IF the target profile UUID matches the session user's UUID, THEN THE Admin_API SHALL return `403 FORBIDDEN` with message `"You cannot change your own role."`.
4. THE Admin_API SHALL restrict this endpoint to callers with `role = 'admin'`.

---

### Requirement 22: Payments — List and Logs

**User Story:** As an admin, I want to view payment records and raw provider logs, so that I can investigate payment issues.

#### Acceptance Criteria

1. WHEN `GET /api/admin/payments` is called, THE Admin_API SHALL return a paginated list of payment records joined with order data, including `{ order_id, order_number, customer_name, customer_phone, total, payment_method, payment_status, mpesa_receipt_number, created_at }`.
2. THE Admin_API SHALL support filtering by `q` (order number or receipt), `payment_method`, `payment_status`, `from`, and `to`.
3. WHEN `GET /api/admin/payments/[orderId]/logs` is called, THE Admin_API SHALL return all `payment_logs` rows for that order ordered by `created_at DESC`.
4. IF the order UUID does not exist, THEN THE Admin_API SHALL return `404 NOT_FOUND` for the logs endpoint.

---

### Requirement 23: Payments — M-Pesa STK Status

**User Story:** As an admin, I want to query the live STK Push status from Safaricom, so that I can resolve payments where the callback was not received.

#### Acceptance Criteria

1. WHEN `GET /api/admin/payments/mpesa/status/[checkoutRequestId]` is called, THE Admin_API SHALL call `querySTKStatus(checkoutRequestId)` from `src/lib/mpesa.ts` and return the raw Safaricom response.


### Requirement 24: Notifications — Database Schema

**User Story:** As a backend developer, I want a `notifications` table in the database, so that admin-facing event alerts can be persisted and queried.

#### Acceptance Criteria

1. THE Admin_API SHALL require a `notifications` table with columns: `id` (UUID PK), `type` (text, NOT NULL), `title` (text, NOT NULL), `message` (text, NOT NULL), `order_id` (UUID FK to `orders`, nullable, ON DELETE SET NULL), `is_read` (boolean, default false), `created_at` (timestamptz, default now()).
2. THE Admin_API SHALL require an index on `notifications(created_at DESC)` and an index on `notifications(is_read)`.
3. THE Admin_API SHALL deliver the schema as `supabase/step2_notifications.sql`.

---

### Requirement 25: Notifications — CRUD Endpoints

**User Story:** As an admin, I want to list, mark, and dismiss notifications, so that I can stay informed about new orders and payment events.

#### Acceptance Criteria

1. WHEN `GET /api/admin/notifications` is called, THE Admin_API SHALL return a paginated list of notifications ordered by `created_at DESC`, including `unread_count` (total unread across all pages) in the response.
2. THE Admin_API SHALL support filtering by `is_read` (boolean) on the notifications list.
3. WHEN `PATCH /api/admin/notifications/[id]/read` is called, THE Admin_API SHALL set `is_read = true` for that notification and return `{ "updated": true }`.
4. WHEN `POST /api/admin/notifications/read-all` is called, THE Admin_API SHALL set `is_read = true` for all notifications and return `{ "updated_count": N }`.
5. WHEN `GET /api/admin/notifications/unread-count` is called, THE Admin_API SHALL return `{ "count": N }` representing the total number of unread notifications.

---

### Requirement 26: Notifications — Internal Helper

**User Story:** As a backend developer, I want a shared `createNotification` helper, so that order and payment routes can emit notifications without duplicating database logic.

#### Acceptance Criteria

1. THE Notification_Helper SHALL accept `(type, title, message, orderId?)` and insert a row into the `notifications` table.
2. WHEN a new order is created via `POST /api/orders`, THE Notification_Helper SHALL be called with `type = 'new_order'` and `title = 'New Order #[order_number]'`.
3. WHEN the M-Pesa callback receives `ResultCode = 0`, THE Notification_Helper SHALL be called with `type = 'payment_completed'` and `title = 'Payment Received for #[order_number]'`.
4. WHEN the M-Pesa callback receives a non-zero `ResultCode`, THE Notification_Helper SHALL be called with `type = 'payment_failed'` and `title = 'Payment Failed for #[order_number]'`.
5. WHEN `POST /api/admin/orders/[id]/cancel` is called, THE Notification_Helper SHALL be called with `type = 'order_cancelled'` and `title = 'Order #[order_number] Cancelled'`.

---

### Requirement 27: M-Pesa — STK Push Initiation

**User Story:** As a customer, I want to initiate an M-Pesa STK Push for my order, so that I can pay from my phone without leaving the checkout page.

#### Acceptance Criteria

1. WHEN `POST /api/payments/mpesa/initiate` is called with a valid `order_id` (UUID) and `phone` (Kenyan format), THE Admin_API SHALL call `initiateSTKPush` and return `{ checkout_request_id, message }`.
2. THE Admin_API SHALL validate `phone` as a Kenyan number (`07xx` or `+2547xx`) and normalise it to `2547XXXXXXXX` before calling the M-Pesa API.
3. IF the order does not exist or its `payment_status` is not `pending`, THEN THE Admin_API SHALL return `422 VALIDATION_ERROR`.
4. WHEN the STK Push succeeds, THE Admin_API SHALL update the order with `mpesa_checkout_request_id` and set `payment_status = 'processing'`.
5. WHEN the STK Push succeeds, THE Admin_API SHALL insert a `payment_logs` row with `{ provider: 'mpesa', event_type: 'stk_push_initiated', raw_payload: stkResponse }`.
6. IF `isMpesaConfigured()` returns `false`, THEN THE Admin_API SHALL return `503 Service Unavailable` with message `"M-Pesa is not configured on this server."`.
7. THE Admin_API SHALL NOT require an admin session for `POST /api/payments/mpesa/initiate` as it is a customer-facing endpoint.


### Requirement 28: Settings — Database Schema

**User Story:** As a backend developer, I want a `store_settings` table in the database, so that global store configuration can be persisted and updated without code changes.

#### Acceptance Criteria

1. THE Admin_API SHALL require a single-row `store_settings` table with columns: `id` (integer PK, default 1, CHECK id = 1), `store_name` (text, default `'Ayola Foods KE'`), `support_email` (text), `support_phone` (text), `default_delivery_fee` (integer, default 150), `delivery_cities` (text[], default `ARRAY['Nairobi']`), `order_notification_emails` (text[], default `'{}'`), `updated_at` (timestamptz, default now()).
2. THE Admin_API SHALL deliver the schema as `supabase/step3_settings.sql`.

---

### Requirement 29: Settings — Read and Update

**User Story:** As an admin, I want to read and update store settings, so that I can configure delivery fees, notification emails, and support contacts without a code deployment.

#### Acceptance Criteria

1. WHEN `GET /api/admin/settings` is called, THE Admin_API SHALL return the current `store_settings` row.
2. WHEN `PATCH /api/admin/settings` is called with any subset of settings fields, THE Admin_API SHALL validate the fields with Zod and update only the provided fields.
3. THE Admin_API SHALL restrict `PATCH /api/admin/settings` to callers with `role = 'admin'`.

---

### Requirement 30: Settings — User Management

**User Story:** As an admin, I want to invite new admin/kitchen users and revoke access, so that I can manage who can access the admin panel.

#### Acceptance Criteria

1. WHEN `POST /api/admin/settings/invite` is called with a valid `email` and `role` (`admin` | `kitchen`), THE Admin_API SHALL call `supabase.auth.admin.inviteUserByEmail(email)` and upsert a `profiles` row with the given role, then return `201 Created` with `{ email, role, invited: true }`.
2. WHEN `DELETE /api/admin/settings/users/[id]` is called, THE Admin_API SHALL set the target user's `profiles.role` to `customer` and return `{ id, role: 'customer' }`.
3. IF the target user ID in `DELETE /api/admin/settings/users/[id]` matches the session user's ID, THEN THE Admin_API SHALL return `400` with message `"You cannot demote yourself."`.
4. THE Admin_API SHALL restrict both user management endpoints to callers with `role = 'admin'`.

---

### Requirement 31: Settings — M-Pesa Credential Test

**User Story:** As an admin, I want to test M-Pesa credentials from the settings page, so that I can verify the integration is working before going live.

#### Acceptance Criteria

1. WHEN `POST /api/admin/settings/test-mpesa` is called, THE Admin_API SHALL attempt to fetch an OAuth token from Safaricom and return `{ success: true, environment: "sandbox"|"production", message: "M-Pesa credentials are valid." }` on success.
2. IF the OAuth token fetch fails, THE Admin_API SHALL return HTTP `200` with `{ success: false, message: "Failed to authenticate: [error detail]" }`.
3. THE Admin_API SHALL restrict this endpoint to callers with `role = 'admin'`.

---

### Requirement 32: Database Migrations

**User Story:** As a backend developer, I want SQL migration files for new tables, so that I can apply schema changes to the Supabase database in a repeatable, ordered way.

#### Acceptance Criteria

1. THE Admin_API SHALL provide `supabase/step2_notifications.sql` containing the `notifications` table DDL, indexes, and any required triggers.
2. THE Admin_API SHALL provide `supabase/step3_settings.sql` containing the `store_settings` table DDL and any required triggers for `updated_at`.
3. WHEN `supabase/step2_notifications.sql` is applied after `step1_tables.sql`, THE Admin_API SHALL result in a valid schema with no constraint violations.
4. WHEN `supabase/step3_settings.sql` is applied after `step2_notifications.sql`, THE Admin_API SHALL result in a valid schema with no constraint violations.
