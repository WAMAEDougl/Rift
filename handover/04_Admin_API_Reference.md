# 04 — Admin API Reference

**Audience:** Developers  
**Base path:** `/api/admin/`  
**Stack:** Next.js 16 Route Handlers, Supabase (PostgreSQL), Zod validation, Supabase Auth

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

Every `/api/admin/*` route:
1. Creates a Supabase server client
2. Calls `supabase.auth.getUser()` to retrieve the session
3. Returns `401 Unauthorized` if no session
4. Fetches the user's `profiles` row and checks `role IN ('admin', 'kitchen')`
5. Returns `403 Forbidden` if not admin/kitchen

A shared helper `requireAdminSession(request)` encapsulates steps 1–5 and returns `{ user, profile }`.

**Kitchen role restriction:** Mutation routes (other than order status) additionally check `profile.role === 'admin'`.

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

Response includes:
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

All admin routes use the **service role** Supabase client to bypass RLS. The service role key is server-only and never returned in any response.

---

## 2. Authentication Endpoints

### `POST /api/admin/auth/login`

Signs in an admin or kitchen user. **Auth required: No**

**Request:**
```json
{ "email": "admin@ayolafoods.com", "password": "••••••••" }
```

**Steps:**
1. Validate (email format, password min 8 chars)
2. Call `supabase.auth.signInWithPassword()`
3. If auth fails → `401` with generic message (does not reveal which field is wrong)
4. Check `profiles.role IN ('admin', 'kitchen')` → if not, sign out and return `403 "Access denied"`

**Response `200`:**
```json
{ "data": { "id": "uuid", "email": "...", "full_name": "Jane Admin", "role": "admin" } }
```

---

### `POST /api/admin/auth/logout`

**Auth required: Yes**

Calls `supabase.auth.signOut()`.

**Response `200`:** `{ "data": { "success": true } }`

---

### `GET /api/admin/auth/me`

Returns current user's profile. Used by the frontend shell. **Auth required: Yes**

**Response `200`:**
```json
{ "data": { "id": "uuid", "full_name": "Jane Admin", "email": "...", "role": "admin" } }
```

---

## 3. Dashboard Endpoints

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

Implementation:
- `total_orders`: `COUNT(*) FROM orders`
- `total_revenue_kes`: `SUM(total) FROM orders WHERE payment_status = 'completed'`
- `pending_orders`: `COUNT(*) FROM orders WHERE status IN ('pending','confirmed')`
- `total_customers`: `COUNT(*) FROM profiles WHERE role = 'customer'`

All four queries run in parallel via `Promise.all`.

---

### `GET /api/admin/dashboard/revenue`

Returns daily revenue for the last N days.

**Query params:**
| Param | Default | Max |
|---|---|---|
| `days` | 14 | 90 |

**Response `data`:**
```json
[
  { "date": "2026-03-20", "revenue_kes": 12500 },
  { "date": "2026-03-21", "revenue_kes": 8750 }
]
```

Implementation: SQL `date_trunc` grouping on orders where `payment_status = 'completed'`.

---

### `GET /api/admin/dashboard/order-status-summary`

Returns count per order status.

**Response `data`:**
```json
[
  { "status": "pending", "count": 5 },
  { "status": "confirmed", "count": 7 },
  { "status": "preparing", "count": 3 }
]
```

---

## 4. Orders Endpoints

### `GET /api/admin/orders`

Paginated, filtered list of orders.

**Query params:**
| Param | Type | Description |
|---|---|---|
| `status` | string | Filter by order status |
| `payment_status` | string | Filter by payment status |
| `delivery_type` | string | Filter by delivery type |
| `from` | ISO date | `created_at >= from` |
| `to` | ISO date | `created_at <= to` |
| `q` | string | Search order_number, name, phone |
| `page` | integer | Pagination |
| `per_page` | integer | Pagination |

**Response `data.items` shape:**
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
{ "status": "confirmed" }
```

**Valid values:** `pending`, `confirmed`, `preparing`, `ready`, `dispatched`, `delivered`, `cancelled`

**Rules:**
- Forward-only transitions enforced (no going backwards)
- `cancelled` is allowed from any non-terminal state
- Setting `delivered` → also sets `completed_at = now()`
- Setting `confirmed` → also sets `confirmed_at = now()`
- Terminal states (`delivered`, `cancelled`) cannot be updated → `409 CONFLICT`

**Kitchen role:** Allowed. Kitchen cannot set `cancelled`.

**Response `data`:** Full updated order object.

---

### `POST /api/admin/orders/bulk-status`

Updates status for multiple orders. **Admin only.**

**Request body:**
```json
{
  "ids": ["uuid-1", "uuid-2"],
  "status": "confirmed",
  "cancel_reason": "optional — required when status = cancelled"
}
```

- `status` restricted to `confirmed` or `cancelled` for bulk operations
- Max 50 IDs per request
- Terminal-state orders are silently skipped

**Response `200`:**
```json
{ "data": { "updated": 4, "skipped": 1, "skipped_ids": ["uuid-of-terminal"] } }
```

---

### `POST /api/admin/orders/[id]/cancel`

Cancels an order. **Admin only.**

**Request body:**
```json
{ "reason": "Customer requested cancellation" }
```

- `reason` is optional free text, appended to `order_notes`
- Sets `status = 'cancelled'`
- If `payment_status = 'completed'` → sets `payment_status = 'refunded'` (status flag only — actual refund is manual)

---

### `DELETE /api/admin/orders/[id]`

Hard-deletes an order. **Admin only.**

- Only allowed if `status = 'cancelled'`
- If not cancelled → `409 CONFLICT`

**Response `data`:** `{ "deleted": true }`

---

## 5. Products Endpoints

### `GET /api/admin/products`

Paginated list of all products (including inactive ones).

**Query params:** `q`, `category_id`, `in_stock` (boolean), `is_active` (boolean), `page`, `per_page`

**Response items:** All product DB columns plus `category_name` (joined).

---

### `GET /api/admin/products/[id]`

Returns a single product by UUID.

---

### `POST /api/admin/products`

Creates a new product.

**Request body (Zod validated):**
```json
{
  "name": "string, required",
  "slug": "string, required, url-safe, unique",
  "category_id": "uuid, required",
  "description": "string, optional",
  "long_description": "string, optional",
  "price": "integer, required, min 1 (in KES)",
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

**Response:** `201 Created` with the new product.

**Conflict:** Duplicate slug → `409 CONFLICT`

---

### `PUT /api/admin/products/[id]`

Full replace. Same body as POST (all fields required). Returns updated product.

---

### `PATCH /api/admin/products/[id]`

Partial update. Any subset of product fields. Used for quick toggles (in_stock, is_active).

---

### `DELETE /api/admin/products/[id]`

Deletes a product. **Admin only.**

**Guard:** If product exists in any `order_items`, does NOT hard-delete.  
Instead: sets `is_active = false` and returns `200` with:
```json
{ "soft_deleted": true, "reason": "Product has order history. Deactivated instead." }
```

If no order history: hard-deletes and returns `{ "deleted": true }`.

---

## 6. Categories Endpoints

### `GET /api/admin/categories`

Returns all categories ordered by `sort_order ASC`. No pagination. Each item includes `product_count`.

### `GET /api/admin/categories/[id]`

Returns a single category.

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

### `PUT /api/admin/categories/[id]`

Full update. Same schema as POST.

### `DELETE /api/admin/categories/[id]`

**Guard:** If category has products → `409 CONFLICT` with message: `"Category has products. Reassign or delete them first."`

---

## 7. Customers Endpoints

### `GET /api/admin/customers`

Paginated list of profiles.

**Query params:** `q` (search name/email/phone), `role`, `page`, `per_page`

Each item includes `order_count` and `total_spent`.

### `GET /api/admin/customers/[id]`

Returns a single profile plus full order history (max 200 orders, no pagination).

**Response `data`:**
```json
{
  "profile": { "...profile fields..." },
  "orders": [ "...order summary objects..." ],
  "stats": {
    "order_count": 14,
    "total_spent_kes": 23500,
    "first_order_at": "2025-11-12T...",
    "last_order_at": "2026-03-28T..."
  }
}
```

### `PATCH /api/admin/customers/[id]/role`

Updates a customer's role. **Admin only.**

**Request body:**
```json
{ "role": "admin" }
```

Valid values: `customer`, `kitchen`, `admin`

**Guard:** Cannot change your own role → `403 FORBIDDEN` with `"You cannot change your own role."`

---

## 8. Payments Endpoints

### `GET /api/admin/payments`

Paginated list of payment records (joins `orders`).

**Query params:** `q` (order number / receipt), `payment_method`, `payment_status`, `from`, `to`, `page`, `per_page`

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
    "raw_payload": { "...json..." },
    "created_at": "..."
  }
]
```

---

## 9. Notifications Endpoints

### `GET /api/admin/notifications`

Paginated list of notifications, newest first.

**Query params:** `is_read` (boolean filter), `page`, `per_page` (default 20)

**Response `data`** includes standard pagination plus `unread_count` (total unread across all pages).

### `GET /api/admin/notifications/unread-count`

Lightweight endpoint for the topbar bell badge.

**Response `data`:** `{ "count": 7 }`

### `PATCH /api/admin/notifications/[id]/read`

Marks a single notification as read.

**Response `data`:** `{ "updated": true }`

### `POST /api/admin/notifications/read-all`

Marks all notifications as read.

**Response `data`:** `{ "updated_count": 12 }`

### Internal: `createNotification(type, title, message, orderId?)`

A server-side helper (not an HTTP endpoint) called from within order and payment API routes.

| Trigger | Notification type | Title |
|---|---|---|
| `POST /api/orders` (new order) | `new_order` | "New Order #AYF-001234" |
| M-Pesa callback (ResultCode=0) | `payment_completed` | "Payment Received for #AYF-001234" |
| M-Pesa callback (ResultCode≠0) | `payment_failed` | "Payment Failed for #AYF-001234" |
| `POST /api/admin/orders/[id]/cancel` | `order_cancelled` | "Order #AYF-001234 Cancelled" |

---

## 10. M-Pesa Endpoints

### `POST /api/payments/mpesa/initiate`

Initiates an STK Push. **Not admin-only — called by the customer checkout page.**

**Request body:**
```json
{
  "order_id": "uuid",
  "phone": "0712345678"
}
```

**Validation:**
- `order_id`: valid UUID, order must exist, `payment_status` must be `pending`
- `phone`: Kenyan number (07xx or +2547xx), normalized to `2547XXXXXXXX`

**Steps:**
1. Fetch order from DB to get `total` and `order_number`
2. Call `initiateSTKPush(phone, amount, orderNumber)` from `src/lib/mpesa.ts`
3. On success: update order `mpesa_checkout_request_id`, set `payment_status = 'processing'`
4. Log event in `payment_logs`: `{ provider: 'mpesa', event_type: 'stk_push_initiated', raw_payload: stkResponse }`

**Response `data`:**
```json
{
  "checkout_request_id": "ws_CO_...",
  "message": "STK Push sent to 0712345678. Enter your M-Pesa PIN."
}
```

**Error:** If M-Pesa is not configured → `503 Service Unavailable`

### `GET /api/admin/payments/mpesa/status/[checkoutRequestId]`

Queries live STK Push status from Safaricom. Used as fallback when callback has not arrived.

---

## 11. Settings Endpoints

### `GET /api/admin/settings`

Returns the current store settings object.

### `PATCH /api/admin/settings`

Partial update of settings. **Admin only.** Accepts any subset of settings fields.

**Zod-validated fields:**
- `store_name` (text)
- `support_email` (text)
- `support_phone` (text)
- `default_delivery_fee` (integer)
- `delivery_cities` (string array)
- `order_notification_emails` (string array)

### `POST /api/admin/settings/test-mpesa`

Tests M-Pesa OAuth token fetch to verify credentials.

**Response `data`:**
```json
{
  "success": true,
  "environment": "sandbox",
  "message": "M-Pesa credentials are valid."
}
```

On failure: `{ "success": false, "message": "Failed to authenticate: ..." }` with HTTP 200 (diagnostic endpoint).

### `POST /api/admin/settings/invite`

Invite a new admin or kitchen user by email. **Admin only.**

**Request body:**
```json
{ "email": "newadmin@ayolafoods.com", "role": "kitchen" }
```

**Steps:**
1. Validate email and role
2. Call `supabase.auth.admin.inviteUserByEmail(email)`
3. Upsert `profiles` row with `{ email, role }` so role is set on invite acceptance

**Response `201`:** `{ "data": { "email": "...", "role": "kitchen", "invited": true } }`

### `DELETE /api/admin/settings/users/[id]`

Revoke admin/kitchen access. Downgrades role to `customer`. Does NOT delete the auth user. **Admin only.**

**Guard:** Cannot demote yourself → `400`.

**Response `200`:** `{ "data": { "id": "uuid", "role": "customer" } }`

---

## 12. Full Route Summary

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

POST   /api/payments/mpesa/initiate   ← customer-facing
POST   /api/payments/mpesa/callback   ← Safaricom webhook
```
