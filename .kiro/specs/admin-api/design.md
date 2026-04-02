# Design Document — Admin API

## Overview

The Admin API is a collection of Next.js 16 Route Handlers (App Router) under `website/src/app/api/admin/` that powers the Ayola Foods KE admin panel. It is backed by Supabase (PostgreSQL) with Supabase Auth for cookie-based sessions, validated with Zod, and written in TypeScript.

All admin routes share a common session guard, response envelope, and pagination contract. A separate customer-facing M-Pesa initiation endpoint lives at `/api/payments/mpesa/initiate` and requires no admin session.

The API is designed to be consumed by a Next.js admin UI at `/admin/*`. It is not a public API and all mutation endpoints are restricted to users with `role = 'admin'` or `role = 'kitchen'` in the `profiles` table.

---

## Architecture

```mermaid
graph TD
    Client["Admin UI / Browser"]
    MW["Next.js Middleware\n(session refresh)"]
    Guard["requireAdminSession()\nwebsite/src/lib/admin/auth.ts"]
    SvcClient["Service Role Client\nwebsite/src/lib/admin/supabase.ts"]
    DB["Supabase PostgreSQL"]
    Auth["Supabase Auth"]
    Mpesa["Safaricom Daraja API"]

    Client -->|cookie session| MW
    MW --> Guard
    Guard -->|getUser()| Auth
    Guard -->|fetch profile| SvcClient
    SvcClient --> DB
    Guard -->|{ user, profile }| RouteHandler["Route Handler"]
    RouteHandler --> SvcClient
    RouteHandler -->|notifications| DB
    RouteHandler -->|STK Push / OAuth| Mpesa
```

**Key design decisions:**

- All admin routes use the **service role client** to bypass Row Level Security. The anon key is never used on admin routes.
- The session guard is a shared helper, not middleware, so each route handler calls it explicitly. This keeps the guard logic testable and avoids coupling to Next.js middleware.
- Response helpers (`ok`, `err`) enforce the envelope shape at the type level, making it impossible to return a malformed response.
- Notifications are fire-and-forget side effects — they do not block the primary response.

---

## File / Directory Structure

```
website/src/app/api/
├── admin/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── me/route.ts
│   ├── dashboard/
│   │   ├── stats/route.ts
│   │   ├── revenue/route.ts
│   │   └── order-status-summary/route.ts
│   ├── orders/
│   │   ├── route.ts                        (GET list, no POST)
│   │   ├── bulk-status/route.ts            (POST)
│   │   └── [id]/
│   │       ├── route.ts                    (GET, DELETE)
│   │       ├── status/route.ts             (PATCH)
│   │       └── cancel/route.ts             (POST)
│   ├── products/
│   │   ├── route.ts                        (GET, POST)
│   │   └── [id]/route.ts                   (GET, PUT, PATCH, DELETE)
│   ├── categories/
│   │   ├── route.ts                        (GET, POST)
│   │   └── [id]/route.ts                   (GET, PUT, DELETE)
│   ├── customers/
│   │   ├── route.ts                        (GET)
│   │   └── [id]/
│   │       ├── route.ts                    (GET)
│   │       └── role/route.ts               (PATCH)
│   ├── payments/
│   │   ├── route.ts                        (GET)
│   │   ├── mpesa/
│   │   │   └── status/
│   │   │       └── [checkoutRequestId]/route.ts  (GET)
│   │   └── [orderId]/
│   │       └── logs/route.ts               (GET)
│   ├── notifications/
│   │   ├── route.ts                        (GET)
│   │   ├── unread-count/route.ts           (GET)
│   │   ├── read-all/route.ts               (POST)
│   │   └── [id]/
│   │       └── read/route.ts               (PATCH)
│   └── settings/
│       ├── route.ts                        (GET, PATCH)
│       ├── invite/route.ts                 (POST)
│       ├── test-mpesa/route.ts             (POST)
│       └── users/
│           └── [id]/route.ts               (DELETE)
└── payments/
    └── mpesa/
        ├── initiate/route.ts               (POST — customer-facing, no admin auth)
        └── callback/route.ts               (POST — already exists)

website/src/lib/admin/
├── auth.ts          — requireAdminSession(request)
├── response.ts      — ok(data, status?) and err(message, code, status)
├── pagination.ts    — parsePagination(searchParams) and paginatedResponse(...)
├── notifications.ts — createNotification(type, title, message, orderId?)
└── supabase.ts      — getAdminClient() service role factory

website/supabase/
├── step2_notifications.sql
└── step3_settings.sql
```

---

## Components and Interfaces

### Shared Infrastructure (`website/src/lib/admin/`)

#### `supabase.ts` — Service Role Client

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

Uses the bare `@supabase/supabase-js` client (not `@supabase/ssr`) because admin routes do not need cookie management — they use the service role key directly.

#### `auth.ts` — Session Guard

```typescript
import { createClient } from "@/lib/supabase/server"; // cookie-based, anon key
import { getAdminClient } from "./supabase";
import { err } from "./response";

export type AdminRole = "admin" | "kitchen";

export interface AdminSession {
  user: { id: string; email: string };
  profile: { id: string; full_name: string | null; email: string | null; role: AdminRole };
}

export async function requireAdminSession(
  request: Request,
  requiredRole?: "admin"
): Promise<AdminSession | Response> {
  // 1. Validate session via cookie-based client
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return err("Unauthorized", "UNAUTHORIZED", 401);
  }

  // 2. Fetch profile using service role to bypass RLS
  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "kitchen"].includes(profile.role)) {
    await supabase.auth.signOut();
    return err("Forbidden", "FORBIDDEN", 403);
  }

  // 3. Enforce admin-only routes
  if (requiredRole === "admin" && profile.role !== "admin") {
    return err("Forbidden", "FORBIDDEN", 403);
  }

  return { user: { id: user.id, email: user.email! }, profile: profile as AdminSession["profile"] };
}
```

Route handlers check `if (session instanceof Response) return session;` after calling `requireAdminSession`.

#### `response.ts` — Envelope Helpers

```typescript
import { NextResponse } from "next/server";

export type ErrorCode =
  | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "CONFLICT" | "VALIDATION_ERROR" | "INTERNAL_ERROR" | "SERVICE_UNAVAILABLE";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null }, { status });
}

export function err(message: string, code: ErrorCode, status: number): NextResponse {
  return NextResponse.json({ data: null, error: { message, code } }, { status });
}
```

#### `pagination.ts` — Pagination Helpers

```typescript
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export function parsePagination(searchParams: URLSearchParams): { page: number; per_page: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const per_page = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10) || 20));
  return { page, per_page, offset: (page - 1) * per_page };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  per_page: number
) {
  return {
    items,
    pagination: {
      page,
      per_page,
      total,
      total_pages: Math.ceil(total / per_page),
    },
  };
}
```

#### `notifications.ts` — Notification Helper

```typescript
import { getAdminClient } from "./supabase";

export type NotificationType = "new_order" | "payment_completed" | "payment_failed" | "order_cancelled";

export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  orderId?: string
): Promise<void> {
  const admin = getAdminClient();
  await admin.from("notifications").insert({ type, title, message, order_id: orderId ?? null });
}
```

---

### Route Handler Design

#### Auth Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `auth/login/route.ts` | POST | None | Zod validate → signInWithPassword → check role → return profile |
| `auth/logout/route.ts` | POST | admin+kitchen | signOut() → return `{ success: true }` |
| `auth/me/route.ts` | GET | admin+kitchen | Return session profile from requireAdminSession |

**Login Zod schema:**
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

#### Dashboard Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `dashboard/stats/route.ts` | GET | admin+kitchen | Promise.all([count orders, sum revenue, count pending, count customers]) |
| `dashboard/revenue/route.ts` | GET | admin+kitchen | Parse `days` (default 14, max 90), SQL date_trunc grouping on completed orders |
| `dashboard/order-status-summary/route.ts` | GET | admin+kitchen | GROUP BY status on orders table |

#### Orders Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `orders/route.ts` | GET | admin+kitchen | Paginated list with filters; item_count via subquery |
| `orders/[id]/route.ts` | GET | admin+kitchen | Full order + order_items join |
| `orders/[id]/route.ts` | DELETE | admin-only | Guard: status must be 'cancelled'; hard-delete |
| `orders/[id]/status/route.ts` | PATCH | admin+kitchen | Zod validate status; enforce transition; set timestamps |
| `orders/[id]/cancel/route.ts` | POST | admin-only | Set cancelled; append reason to notes; set refunded if completed |
| `orders/bulk-status/route.ts` | POST | admin-only | Validate ≤50 IDs; skip terminal; transaction update; return counts |

**Status Zod schema:**
```typescript
const orderStatusSchema = z.object({
  status: z.enum(["pending","confirmed","preparing","ready","dispatched","delivered","cancelled"]),
});
```

**Bulk status Zod schema:**
```typescript
const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  status: z.enum(["confirmed", "cancelled"]),
  cancel_reason: z.string().optional(),
});
```

#### Products Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `products/route.ts` | GET | admin+kitchen | Paginated; join category_name; include inactive |
| `products/route.ts` | POST | admin-only | Zod validate; check slug conflict; insert; return 201 |
| `products/[id]/route.ts` | GET | admin+kitchen | Single product by UUID |
| `products/[id]/route.ts` | PUT | admin-only | Full replace |
| `products/[id]/route.ts` | PATCH | admin-only | Partial update |
| `products/[id]/route.ts` | DELETE | admin-only | Check order_items; soft-delete or hard-delete |

**Product create/PUT Zod schema:**
```typescript
const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category_id: z.string().uuid(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  price: z.number().int().min(1),
  size: z.string().optional(),
  image_url: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  nutrition_highlights: z.array(z.string()).optional(),
  badge: z.string().optional(),
  in_stock: z.boolean().default(true),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
```

#### Categories Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `categories/route.ts` | GET | admin+kitchen | All categories ordered by sort_order; product_count join |
| `categories/route.ts` | POST | admin-only | Zod validate; insert; return 201 |
| `categories/[id]/route.ts` | GET | admin+kitchen | Single category |
| `categories/[id]/route.ts` | PUT | admin-only | Full replace |
| `categories/[id]/route.ts` | DELETE | admin-only | Guard: no products; hard-delete or 409 |

**Category Zod schema:**
```typescript
const categorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  bg_color: z.string().optional(),
  ships_countrywide: z.boolean().default(false),
  price_from: z.number().int().optional(),
  sort_order: z.number().int().default(0),
});
```

#### Customers Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `customers/route.ts` | GET | admin+kitchen | Paginated profiles; order_count + total_spent aggregates |
| `customers/[id]/route.ts` | GET | admin+kitchen | Profile + orders (max 200) + stats |
| `customers/[id]/role/route.ts` | PATCH | admin-only | Validate role enum; guard self-change; update profile |

#### Payments Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `payments/route.ts` | GET | admin+kitchen | Paginated orders with payment fields; filters |
| `payments/[orderId]/logs/route.ts` | GET | admin+kitchen | payment_logs for order; 404 if order missing |
| `payments/mpesa/status/[checkoutRequestId]/route.ts` | GET | admin+kitchen | Call querySTKStatus; return raw response |

#### Notifications Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `notifications/route.ts` | GET | admin+kitchen | Paginated; is_read filter; include unread_count |
| `notifications/unread-count/route.ts` | GET | admin+kitchen | COUNT where is_read = false |
| `notifications/[id]/read/route.ts` | PATCH | admin+kitchen | Set is_read = true |
| `notifications/read-all/route.ts` | POST | admin+kitchen | UPDATE all; return updated_count |

#### Settings Routes

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `settings/route.ts` | GET | admin+kitchen | Return store_settings row |
| `settings/route.ts` | PATCH | admin-only | Zod partial validate; update provided fields |
| `settings/invite/route.ts` | POST | admin-only | Validate email+role; inviteUserByEmail; upsert profile |
| `settings/users/[id]/route.ts` | DELETE | admin-only | Guard self-demotion; set role='customer' |
| `settings/test-mpesa/route.ts` | POST | admin-only | Call getOAuthToken; return success/failure |

**Settings PATCH Zod schema:**
```typescript
const settingsSchema = z.object({
  store_name: z.string().min(1).optional(),
  support_email: z.string().email().optional(),
  support_phone: z.string().optional(),
  default_delivery_fee: z.number().int().min(0).optional(),
  delivery_cities: z.array(z.string()).optional(),
  order_notification_emails: z.array(z.string().email()).optional(),
}).strict();
```

#### Customer-Facing M-Pesa Route

| File | Method | Auth | Key Logic |
|---|---|---|---|
| `payments/mpesa/initiate/route.ts` | POST | None | Validate order+phone; normalise phone; initiateSTKPush; update order; log |

**Initiate Zod schema:**
```typescript
const initiateSchema = z.object({
  order_id: z.string().uuid(),
  phone: z.string().regex(/^(07\d{8}|\+2547\d{8}|2547\d{8})$/),
});
```

---

## Data Models

### TypeScript Types (`website/src/lib/admin/types.ts`)

```typescript
export type OrderStatus =
  | "pending" | "confirmed" | "preparing"
  | "ready" | "dispatched" | "delivered" | "cancelled";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type NotificationType = "new_order" | "payment_completed" | "payment_failed" | "order_cancelled";

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
```

### Order Status Transition Logic

```typescript
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

/**
 * Returns true if the transition from `current` to `next` is valid.
 * Rules:
 *   - Terminal states cannot be updated.
 *   - 'cancelled' is allowed from any non-terminal state.
 *   - All other transitions must be strictly forward in the sequence.
 */
export function isValidStatusTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (TERMINAL_STATUSES.includes(current)) return false;
  if (next === "cancelled") return true;
  const currentIdx = ORDER_STATUS_SEQUENCE.indexOf(current);
  const nextIdx = ORDER_STATUS_SEQUENCE.indexOf(next);
  return nextIdx > currentIdx;
}
```

### Database Migrations

#### `website/supabase/step2_notifications.sql`

```sql
-- STEP 2: Notifications table

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
```

#### `website/supabase/step3_settings.sql`

```sql
-- STEP 3: Store settings (single-row table)

CREATE TABLE public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text DEFAULT 'Ayola Foods KE',
  support_email text,
  support_phone text,
  default_delivery_fee integer DEFAULT 150,
  delivery_cities text[] DEFAULT ARRAY['Nairobi'],
  order_notification_emails text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Seed the single row
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- updated_at trigger (reuses function from step1)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Response Envelope Mutual Exclusivity

*For any* response returned by any admin API handler, exactly one of `data` and `error` is non-null — never both null, never both non-null.

**Validates: Requirements 1.1, 1.2**

### Property 2: Error Code to HTTP Status Mapping

*For any* call to `err(message, code, status)`, the resulting HTTP response status must match the canonical mapping: `UNAUTHORIZED→401`, `FORBIDDEN→403`, `NOT_FOUND→404`, `CONFLICT→409`, `VALIDATION_ERROR→422`, `INTERNAL_ERROR→500`, `SERVICE_UNAVAILABLE→503`.

**Validates: Requirements 1.3**

### Property 3: Session Guard Role Enforcement

*For any* request carrying a session where the profile's role is not `admin` or `kitchen`, `requireAdminSession` must return a 403 response and never return an `AdminSession` object.

**Validates: Requirements 2.3, 2.4, 2.6**

### Property 4: Pagination Total Pages Invariant

*For any* total item count `N` and per_page value `P` (where `1 ≤ P ≤ 100`), the `total_pages` field in the pagination metadata must equal `Math.ceil(N / P)`.

**Validates: Requirements 3.2**

### Property 5: Per-Page Clamping

*For any* `per_page` query parameter value greater than 100, `parsePagination` must return `per_page = 100` and never a value exceeding 100.

**Validates: Requirements 3.3**

### Property 6: Service Role Key Exclusion from Responses

*For any* response body from any admin endpoint, the string value of `SUPABASE_SERVICE_ROLE_KEY` must not appear anywhere in the serialised JSON.

**Validates: Requirements 4.2**

### Property 7: Zod Validation Rejects Invalid Bodies

*For any* request body that fails the endpoint's Zod schema, the handler must return HTTP 422 with error code `VALIDATION_ERROR` without executing any database operation.

**Validates: Requirements 5.2, 17.2, 19.4, 21.2**

### Property 8: Forward-Only Status Transitions

*For any* order in status `S` and any requested next status `N`, the transition is valid if and only if: (a) `S` is not a terminal state, AND (b) either `N = 'cancelled'` OR the index of `N` in `ORDER_STATUS_SEQUENCE` is strictly greater than the index of `S`.

**Validates: Requirements 12.3, 12.6**

### Property 9: Terminal Orders Cannot Be Updated

*For any* order whose current status is `delivered` or `cancelled`, any `PATCH /status` request must return `409 CONFLICT` regardless of the requested next status.

**Validates: Requirements 12.6**

### Property 10: Bulk Update Count Invariant

*For any* bulk-status request with `N` valid order IDs, the response fields `updated + skipped` must equal `N`.

**Validates: Requirements 14.1, 14.4**

### Property 11: Product Delete Guard

*For any* product that has at least one row in `order_items`, a `DELETE` request must not hard-delete the product — it must set `is_active = false` and return `{ soft_deleted: true }`.

**Validates: Requirements 18.3, 18.4**

### Property 12: Category Delete Guard

*For any* category that has at least one associated product, a `DELETE` request must return `409 CONFLICT` and must not remove the category row.

**Validates: Requirements 19.6**

### Property 13: Notification Round Trip

*For any* call to `createNotification(type, title, message, orderId?)`, a subsequent query of the `notifications` table must return a row with matching `type`, `title`, `message`, and `order_id`.

**Validates: Requirements 26.1**

### Property 14: Phone Normalisation

*For any* Kenyan phone number in format `07XXXXXXXX`, `+2547XXXXXXXX`, or `2547XXXXXXXX`, the normalisation function must produce exactly `2547XXXXXXXX` (12 digits, no `+` prefix).

**Validates: Requirements 27.2**

### Property 15: Self-Role Modification Forbidden

*For any* admin user who is the session owner, any request to change or demote their own role (via `PATCH /customers/[id]/role` or `DELETE /settings/users/[id]`) must return a 4xx error and must not modify the caller's profile row.

**Validates: Requirements 21.3, 30.3**

---

## Error Handling

| Scenario | HTTP | Code | Notes |
|---|---|---|---|
| No session cookie / expired token | 401 | `UNAUTHORIZED` | Session guard returns before any DB call |
| Valid session but role = customer | 403 | `FORBIDDEN` | Guard calls signOut() first |
| Kitchen user on admin-only route | 403 | `FORBIDDEN` | Guard checks requiredRole param |
| Resource not found (order, product, etc.) | 404 | `NOT_FOUND` | Route handler checks `.data === null` |
| Slug/unique constraint violation | 409 | `CONFLICT` | Caught from Supabase error code `23505` |
| Invalid status transition | 409 | `CONFLICT` | isValidStatusTransition returns false |
| Zod parse failure | 422 | `VALIDATION_ERROR` | First Zod issue message included |
| Unexpected DB or runtime error | 500 | `INTERNAL_ERROR` | Logged server-side; generic message to client |
| M-Pesa not configured | 503 | `SERVICE_UNAVAILABLE` | isMpesaConfigured() check |

All errors use the `err()` helper to guarantee envelope shape. Errors are never thrown across the HTTP boundary — all `catch` blocks return an `err(...)` response.

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:

- **Unit tests** cover specific examples, integration points, and error conditions with known inputs.
- **Property tests** verify universal invariants across randomly generated inputs, catching edge cases that examples miss.

### Property-Based Testing

**Library:** [`fast-check`](https://github.com/dubzzz/fast-check) — TypeScript-native, no additional runtime dependencies.

Install: `npm install --save-dev fast-check`

Each property test must run a minimum of **100 iterations** (fast-check default is 100; set `numRuns: 100` explicitly).

Each test must include a comment tag in the format:
```
// Feature: admin-api, Property N: <property text>
```

**Property test mapping:**

| Property | Test file | Arbitraries |
|---|---|---|
| P1: Envelope mutual exclusivity | `lib/admin/response.test.ts` | `fc.anything()` for data payload |
| P2: Error code → HTTP status | `lib/admin/response.test.ts` | `fc.constantFrom(...errorCodes)` |
| P3: Session guard role enforcement | `lib/admin/auth.test.ts` | `fc.string()` for role values |
| P4: Pagination total_pages | `lib/admin/pagination.test.ts` | `fc.integer({ min: 0, max: 10000 })` for total, `fc.integer({ min: 1, max: 100 })` for per_page |
| P5: Per-page clamping | `lib/admin/pagination.test.ts` | `fc.integer({ min: 101, max: 10000 })` for per_page |
| P7: Zod rejects invalid bodies | `lib/admin/schemas.test.ts` | `fc.record(...)` with invalid field types |
| P8+P9: Status transitions | `lib/admin/status.test.ts` | `fc.constantFrom(...statuses)` for current and next |
| P10: Bulk count invariant | `app/api/admin/orders/bulk-status.test.ts` | `fc.array(fc.uuid(), { minLength: 1, maxLength: 50 })` |
| P14: Phone normalisation | `lib/utils/validation.test.ts` | `fc.integer({ min: 700000000, max: 799999999 })` for suffix |

### Unit Tests

Unit tests focus on:

- **Auth flow examples**: login success, login with wrong password (401), login with non-admin role (403), logout, /me
- **Order lifecycle examples**: create → confirm → prepare → deliver; cancel with refund; delete cancelled order
- **Product CRUD examples**: create with slug conflict (409); delete with order history (soft-delete); delete without history (hard-delete)
- **Category delete guard**: 409 when products exist
- **Notification triggers**: new order, payment callback success/failure, order cancel
- **M-Pesa initiate**: 503 when not configured; 422 when order not pending; success path
- **Settings invite**: 201 with correct profile upsert; self-demotion 400

### Test Configuration

```typescript
// vitest.config.ts — run with: npx vitest --run
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
});
```

Property tests use fast-check's `fc.assert(fc.property(...), { numRuns: 100 })` pattern.
