# Ayola Foods KE — Admin API Requirements

**Document type:** API / Backend Specification
**Scope:** Full admin panel — all API routes
**Stack:** Next.js 16 Route Handlers, Supabase (PostgreSQL), Zod validation, Supabase Auth
**Base path:** `/api/admin/`

---

## 1. Global Standards

### 1.1 Response Envelope

All endpoints return a consistent JSON shape:

```json
// Success
{ "data": <payload>, "error": null }

// Error
{ "data": null, "error": { "message": "...", "code": "ERROR_CODE" } }
```

### 1.2 Authentication

Every `/api/admin/*` route must:

1. Create a Supabase server client
2. Call `supabase.auth.getUser()` to retrieve the session
3. If no session → return `401 Unauthorized`
4. Fetch the user's `profiles` row and check `role IN ('admin', 'kitchen')`
5. If not admin/kitchen → return `403 Forbidden`

A shared server-side helper `requireAdminSession(request)` should encapsulate steps 1–5 and return `{ user, profile }` or throw a typed error that the route handler converts to the correct HTTP response.

**Kitchen role restriction:** Routes that mutate data other than order status must additionally check `profile.role === 'admin'`. If kitchen tries to call those endpoints → `403 Forbidden`.

### 1.3 HTTP Methods

| Action | Method |
|---|---|
| Fetch list | GET |
| Fetch single | GET |
| Create | POST |
| Full update | PUT |
| Partial update | PATCH |
| Delete | DELETE |

### 1.4 Pagination

All list endpoints accept:

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | 1-based page number |
| `per_page` | integer | 20 | Max 100 |

Response includes pagination metadata in `data`:

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 143,
      "total_pages": 8
    }
  }
}
```

### 1.5 Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No session |
| `FORBIDDEN` | 403 | Wrong role |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Zod validation failed |
| `CONFLICT` | 409 | Unique constraint violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 1.6 Supabase Client

All admin routes use the **service role** Supabase client to bypass Row Level Security. The service role key is server-only and never returned in any response.

---

## 2. Authentication

### `POST /api/admin/auth/login`

Signs in an admin or kitchen user.

**Auth required:** No

**Request body:**
```json
{ "email": "admin@ayolafoods.com", "password": "••••••••" }
```

**Steps:**
1. Validate with Zod (email format, password min 8)
2. Call `supabase.auth.signInWithPassword({ email, password })`
3. If auth fails → `401` with generic `"Invalid email or password"` (do not reveal which field)
4. Check `profiles.role IN ('admin', 'kitchen')` → if not, sign out and return `403 "Access denied"`
5. Return profile

**Response `200`:**
```json
{ "data": { "id": "uuid", "email": "...", "full_name": "Jane Admin", "role": "admin" } }
```

---

### `POST /api/admin/auth/logout`

**Auth required:** Yes

Calls `supabase.auth.signOut()`. Returns `{ "data": { "success": true } }`.

---

### `GET /api/admin/auth/me`

**Auth required:** Yes

Returns current user's profile. Used by the frontend shell to display name and role on load.

**Response `200`:**
```json
{ "data": { "id": "uuid", "full_name": "Jane Admin", "email": "...", "role": "admin" } }
```

---

## 3. Dashboard

### `GET /api/admin/dashboard/stats`

Returns aggregate numbers for the stat cards.

**Response `data`:**

```json
{
  "total_orders": 241,
  "total_revenue_kes": 487500,
  "pending_orders": 12,
  "total_customers": 198
}
```

**Implementation notes:**

- `total_orders`: `SELECT COUNT(*) FROM orders`
- `total_revenue_kes`: `SELECT SUM(total) FROM orders WHERE payment_status = 'completed'`
- `pending_orders`: `SELECT COUNT(*) FROM orders WHERE status IN ('pending','confirmed')`
- `total_customers`: `SELECT COUNT(*) FROM profiles WHERE role = 'customer'`

Run all four queries in parallel using `Promise.all`.

---

### `GET /api/admin/dashboard/revenue`

Returns daily revenue for the last N days.

**Query params:**

| Param | Default | Description |
|---|---|---|
| `days` | 14 | Number of days to look back (max 90) |

**Response `data`:**

```json
[
  { "date": "2026-03-20", "revenue_kes": 12500 },
  { "date": "2026-03-21", "revenue_kes": 8750 },
  ...
]
```

**Implementation:** Use a SQL date_trunc grouping on `completed_at` or `created_at` for orders where `payment_status = 'completed'`.

---

### `GET /api/admin/dashboard/order-status-summary`

Returns count per order status.

**Response `data`:**

```json
[
  { "status": "pending", "count": 5 },
  { "status": "confirmed", "count": 7 },
  { "status": "preparing", "count": 3 },
  ...
]
```

---

## 3. Orders

### `GET /api/admin/orders`

Returns a paginated, filtered list of orders.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by order status |
| `payment_status` | string | Filter by payment status |
| `delivery_type` | string | Filter by delivery type |
| `from` | ISO date string | `created_at >= from` |
| `to` | ISO date string | `created_at <= to` |
| `q` | string | Search order_number, customer_name, customer_phone |
| `page` | integer | Pagination |
| `per_page` | integer | Pagination |

**Response `data.items` shape (per order):**

```json
{
  "id": "uuid",
  "order_number": "AYF-001234",
  "customer_name": "Jane Doe",
  "customer_phone": "0712345678",
  "item_count": 3,
  "subtotal": 1800,
  "delivery_fee": 150,
  "total": 1950,
  "delivery_type": "delivery",
  "status": "preparing",
  "payment_method": "mpesa",
  "payment_status": "completed",
  "created_at": "2026-04-02T10:30:00Z"
}
```

`item_count` is computed from `order_items` count — use a Supabase `select` with aggregate or a separate count query.

---

### `GET /api/admin/orders/[id]`

Returns a single order with full detail including line items.

**Response `data`:**

```json
{
  "id": "uuid",
  "order_number": "AYF-001234",
  "customer_id": "uuid | null",
  "customer_name": "Jane Doe",
  "customer_phone": "0712345678",
  "customer_email": "jane@example.com",
  "delivery_address": "123 Main St, Westlands",
  "delivery_city": "Nairobi",
  "delivery_type": "delivery",
  "order_notes": "Leave at gate",
  "subtotal": 1800,
  "delivery_fee": 150,
  "total": 1950,
  "payment_method": "mpesa",
  "payment_status": "completed",
  "mpesa_checkout_request_id": "ws_CO_...",
  "mpesa_receipt_number": "QHF2XXXXX",
  "status": "preparing",
  "created_at": "2026-04-02T10:30:00Z",
  "confirmed_at": "2026-04-02T10:35:00Z",
  "completed_at": null,
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name": "Ugali Flour 2kg",
      "product_price": 600,
      "quantity": 2,
      "line_total": 1200
    }
  ]
}
```

---

### `PATCH /api/admin/orders/[id]/status`

Updates the order status.

**Request body:**

```json
{
  "status": "confirmed"
}
```

**Validation (Zod):**

- `status` must be one of: `pending`, `confirmed`, `preparing`, `ready`, `dispatched`, `delivered`, `cancelled`
- Forward-only transitions enforced: cannot move backwards (e.g., delivered → preparing is rejected), except `cancelled` is allowed from any non-terminal state
- If setting `status = 'delivered'`: also set `completed_at = now()`
- If setting `status = 'confirmed'`: also set `confirmed_at = now()`

**Terminal states:** `delivered`, `cancelled`. Attempting to update a terminal-state order returns `409 CONFLICT` with message "Order is already [status] and cannot be updated."

**Response `data`:** Full updated order object (same shape as GET /api/admin/orders/[id]).

**Kitchen role:** Allowed. Kitchen cannot set status to `cancelled`.

---

### `POST /api/admin/orders/bulk-status`

Updates status for multiple orders in one request. **Admin only.**

**Request body:**
```json
{
  "ids": ["uuid-1", "uuid-2"],
  "status": "confirmed",
  "cancel_reason": "optional — required when status = cancelled"
}
```

`status` is restricted to `confirmed` or `cancelled` for bulk operations. Max 50 IDs per request.

**Steps:** For each valid order apply the same rules as single status update. Silently skip terminal-state orders (report in response). Wrap in a single DB transaction.

**Response `200`:**
```json
{ "data": { "updated": 4, "skipped": 1, "skipped_ids": ["uuid-of-terminal"] } }
```

---

### `DELETE /api/admin/orders/[id]`

Hard-deletes an order. **Admin role only.**

Only allowed if `status = 'cancelled'`. If order is not cancelled, return `409 CONFLICT`.

**Response `data`:** `{ "deleted": true }`

---

### `POST /api/admin/orders/[id]/cancel`

Cancels an order. Sets `status = 'cancelled'`.

**Request body:**

```json
{
  "reason": "Customer requested cancellation"
}
```

`reason` is optional free text, stored in `order_notes` (appended, not overwritten). Also sets `payment_status = 'refunded'` if `payment_status = 'completed'` (refund is manual — this is a status flag only).

**Admin role only.**

---

## 4. Products

### `GET /api/admin/products`

Paginated list of all products (including inactive ones, unlike the customer-facing route).

**Query params:** `q` (search name/slug), `category_id`, `in_stock` (boolean), `is_active` (boolean), `page`, `per_page`.

**Response items shape:** All product columns from the DB plus `category_name` (joined).

---

### `GET /api/admin/products/[id]`

Returns a single product by UUID (not slug — admin uses IDs).

---

### `POST /api/admin/products`

Creates a new product.

**Request body (Zod schema):**

```json
{
  "name": "string, required",
  "slug": "string, required, url-safe",
  "category_id": "uuid, required",
  "description": "string, optional",
  "long_description": "string, optional",
  "price": "integer, required, min 1 (in KES — stored as-is, not cents)",
  "size": "string, optional",
  "image_url": "string, optional, valid URL",
  "features": "string[], optional",
  "ingredients": "string, optional",
  "nutrition_highlights": "string[], optional",
  "badge": "string, optional",
  "in_stock": "boolean, default true",
  "is_active": "boolean, default true",
  "sort_order": "integer, default 0"
}
```

Returns `201 Created` with the new product.

**Conflict check:** If slug already exists → `409 CONFLICT`.

---

### `PUT /api/admin/products/[id]`

Full replace of a product. Same body schema as POST (all fields required). Returns updated product.

---

### `PATCH /api/admin/products/[id]`

Partial update. Accepts any subset of product fields. Used for quick toggles (in_stock, is_active) from the table.

---

### `DELETE /api/admin/products/[id]`

Deletes a product. **Admin only.**

**Guard:** If the product exists in any `order_items` row, do not hard-delete. Instead set `is_active = false` and return `200` with `{ "soft_deleted": true, "reason": "Product has order history. Deactivated instead." }`.

If no order history, hard-delete and return `{ "deleted": true }`.

---

## 5. Categories

### `GET /api/admin/categories`

Returns all categories ordered by `sort_order ASC`. No pagination (there will be fewer than 50 categories).

Each item includes a `product_count` derived from joining `products`.

---

### `GET /api/admin/categories/[id]`

Returns a single category.

---

### `POST /api/admin/categories`

Creates a category.

**Request body (Zod):**

```json
{
  "slug": "string, required, unique",
  "name": "string, required",
  "tagline": "string, optional",
  "icon": "string, optional",
  "description": "string, optional",
  "color": "string, optional (hex)",
  "bg_color": "string, optional (hex)",
  "ships_countrywide": "boolean, default false",
  "price_from": "integer, optional",
  "sort_order": "integer, default 0"
}
```

---

### `PUT /api/admin/categories/[id]`

Full update. Same schema as POST.

---

### `DELETE /api/admin/categories/[id]`

**Guard:** If the category has products, reject with `409 CONFLICT` and message: "Category has products. Reassign or delete them first."

---

## 6. Customers

### `GET /api/admin/customers`

Paginated list of profiles.

**Query params:** `q` (search name/email/phone), `role` (filter by role), `page`, `per_page`.

Each item includes `order_count` (count of their orders) and `total_spent` (sum of `total` for completed-payment orders).

---

### `GET /api/admin/customers/[id]`

Returns a single profile plus their full order history (orders list, no pagination on orders — max 200).

**Response `data`:**

```json
{
  "profile": { ...profile fields... },
  "orders": [ ...order summary objects... ],
  "stats": {
    "order_count": 14,
    "total_spent_kes": 23500,
    "first_order_at": "2025-11-12T...",
    "last_order_at": "2026-03-28T..."
  }
}
```

---

### `PATCH /api/admin/customers/[id]/role`

Updates a customer's role. **Admin only.**

**Request body:**

```json
{ "role": "admin" }
```

`role` must be one of: `customer`, `kitchen`, `admin`.

Cannot change your own role (compare `id` with session user id) → `403 FORBIDDEN` with message "You cannot change your own role."

---

## 7. Payments

### `GET /api/admin/payments`

Paginated list of payment records. Joins `orders` to show customer and amount.

**Query params:** `q` (order number / receipt), `payment_method`, `payment_status`, `from`, `to`, `page`, `per_page`.

**Response items shape:**

```json
{
  "order_id": "uuid",
  "order_number": "AYF-001234",
  "customer_name": "Jane Doe",
  "customer_phone": "0712345678",
  "total": 1950,
  "payment_method": "mpesa",
  "payment_status": "completed",
  "mpesa_receipt_number": "QHF2XXXXX",
  "created_at": "..."
}
```

---

### `GET /api/admin/payments/[orderId]/logs`

Returns all `payment_logs` rows for a given order, newest first.

**Response `data`:**

```json
[
  {
    "id": "uuid",
    "order_id": "uuid",
    "provider": "mpesa",
    "event_type": "stk_callback",
    "raw_payload": { ...json... },
    "created_at": "..."
  }
]
```

---

## 8. Notifications

### Database table required

A `notifications` table must be added to the schema:

```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,          -- new_order | payment_completed | payment_failed | order_cancelled
  title text NOT NULL,
  message text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
```

Notifications are created server-side by existing API routes (orders, payments) as a side effect.

---

### `GET /api/admin/notifications`

Returns paginated list of notifications, newest first.

**Query params:** `is_read` (boolean filter), `page`, `per_page` (default 20).

**Response `data`** includes standard pagination plus `unread_count` (total unread across all pages).

---

### `GET /api/admin/notifications/unread-count`

Lightweight endpoint for the topbar bell badge.

**Response `data`:** `{ "count": 7 }`

---

### `PATCH /api/admin/notifications/[id]/read`

Marks a single notification as read.

**Response `data`:** `{ "updated": true }`

---

### `POST /api/admin/notifications/read-all`

Marks all notifications as read.

**Response `data`:** `{ "updated_count": 12 }`

---

### Internal: `createNotification(type, title, message, orderId?)`

A server-side helper (not an HTTP endpoint) called from within order and payment API routes.

| Trigger location | Notification type | Title |
|---|---|---|
| `POST /api/orders` (new order placed) | `new_order` | "New Order #AYF-001234" |
| `POST /api/payments/mpesa/callback` (ResultCode=0) | `payment_completed` | "Payment Received for #AYF-001234" |
| `POST /api/payments/mpesa/callback` (ResultCode≠0) | `payment_failed` | "Payment Failed for #AYF-001234" |
| `POST /api/admin/orders/[id]/cancel` | `order_cancelled` | "Order #AYF-001234 Cancelled" |

---

## 9. M-Pesa Payments

### `POST /api/payments/mpesa/initiate`

Initiates an STK Push for an existing order. Called by the checkout page after order creation.

**Request body:**

```json
{
  "order_id": "uuid",
  "phone": "0712345678"
}
```

**Validation:**
- `order_id`: valid UUID, order must exist, `payment_status` must be `pending`
- `phone`: Kenyan phone number (07xx or +2547xx), normalized to `2547XXXXXXXX`

**Steps:**
1. Fetch order from DB to get `total` and `order_number`
2. Call `initiateSTKPush(phone, amount, orderNumber)` from `src/lib/mpesa.ts`
3. On success: update order with `mpesa_checkout_request_id`, set `payment_status = 'processing'`
4. Log event in `payment_logs`: `{ provider: 'mpesa', event_type: 'stk_push_initiated', raw_payload: stkResponse }`

**Response `data`:**

```json
{
  "checkout_request_id": "ws_CO_...",
  "message": "STK Push sent to 0712345678. Enter your M-Pesa PIN."
}
```

**Error:** If M-Pesa is not configured (`isMpesaConfigured() === false`), return `503 Service Unavailable` with `{ error: { message: "M-Pesa is not configured on this server." } }`.

**Auth:** This endpoint is **not** admin-only — it is called by the customer-facing checkout. No admin session check. However, it must verify the order exists and is in `pending` state to prevent replay abuse.

---

### `POST /api/payments/mpesa/callback` *(already exists)*

Handles the Safaricom callback. No changes needed unless the existing implementation is incomplete.

---

### `GET /api/admin/payments/mpesa/status/[checkoutRequestId]`

Queries the live STK Push status from Safaricom. Used as a fallback when the callback has not arrived.

Calls `querySTKStatus(checkoutRequestId)` from `src/lib/mpesa.ts`.

**Response `data`:** Raw Safaricom query response forwarded as-is.

---

## 10. Settings

### `POST /api/admin/settings/invite`

Invite a new admin or kitchen user by email. **Admin only.**

**Request body:**
```json
{ "email": "newadmin@ayolafoods.com", "role": "kitchen" }
```

**Steps:**
1. Validate email and role (`admin` | `kitchen`)
2. Call `supabase.auth.admin.inviteUserByEmail(email)`
3. Upsert `profiles` row with `{ email, role }` so role is set when they accept the invite

**Response `201`:** `{ "data": { "email": "...", "role": "kitchen", "invited": true } }`

---

### `DELETE /api/admin/settings/users/[id]`

Revoke admin/kitchen access by downgrading their role to `customer`. Does not delete the Supabase Auth user. **Admin only.**

**Guard:** Cannot demote yourself → `400`.

**Response `200`:** `{ "data": { "id": "uuid", "role": "customer" } }`

---

### `GET /api/admin/settings`

Returns the current settings object. Settings are stored in a `settings` key-value table or a single-row config table.

**Recommended: single-row table**

```sql
CREATE TABLE public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- enforces single row
  store_name text DEFAULT 'Ayola Foods KE',
  support_email text,
  support_phone text,
  default_delivery_fee integer DEFAULT 150,
  delivery_cities text[] DEFAULT ARRAY['Nairobi'],
  order_notification_emails text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
```

---

### `PATCH /api/admin/settings`

Partial update of settings. **Admin only.**

**Request body:** Any subset of the settings fields listed above.

**Validation:** Zod schema matching each field type.

---

### `POST /api/admin/settings/test-mpesa`

Tests the M-Pesa OAuth token fetch to verify credentials are working. Does not initiate a payment.

Calls `getOAuthToken()` internally (expose it from `src/lib/mpesa.ts`).

**Response `data`:**

```json
{
  "success": true,
  "environment": "sandbox",
  "message": "M-Pesa credentials are valid."
}
```

On failure: `{ "success": false, "message": "Failed to authenticate: ..." }` with HTTP 200 (this is a diagnostic endpoint, not an error).

---

## 11. Route Summary

```
POST   /api/admin/auth/login
POST   /api/admin/auth/logout
GET    /api/admin/auth/me

GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/revenue
GET    /api/admin/dashboard/order-status-summary

GET    /api/admin/orders
GET    /api/admin/orders/[id]
PATCH  /api/admin/orders/[id]/status
POST   /api/admin/orders/[id]/cancel
POST   /api/admin/orders/bulk-status
DELETE /api/admin/orders/[id]

GET    /api/admin/products
GET    /api/admin/products/[id]
POST   /api/admin/products
PUT    /api/admin/products/[id]
PATCH  /api/admin/products/[id]
DELETE /api/admin/products/[id]

GET    /api/admin/categories
GET    /api/admin/categories/[id]
POST   /api/admin/categories
PUT    /api/admin/categories/[id]
DELETE /api/admin/categories/[id]

GET    /api/admin/customers
GET    /api/admin/customers/[id]
PATCH  /api/admin/customers/[id]/role

GET    /api/admin/payments
GET    /api/admin/payments/[orderId]/logs
GET    /api/admin/payments/mpesa/status/[checkoutRequestId]

GET    /api/admin/notifications
GET    /api/admin/notifications/unread-count
PATCH  /api/admin/notifications/[id]/read
POST   /api/admin/notifications/read-all

GET    /api/admin/settings
PATCH  /api/admin/settings
POST   /api/admin/settings/test-mpesa
POST   /api/admin/settings/invite
DELETE /api/admin/settings/users/[id]

POST   /api/payments/mpesa/initiate          ← customer-facing, not admin
```

---

## 12. Database Additions Required

Two new tables are needed beyond `step1_tables.sql`:

### `notifications`

See Section 8. Add as `supabase/step2_notifications.sql`.

### `store_settings`

See Section 10. Add as `supabase/step3_settings.sql`.

Both files should follow the same format as `step1_tables.sql` (CREATE TABLE, indexes, triggers for updated_at where applicable).
