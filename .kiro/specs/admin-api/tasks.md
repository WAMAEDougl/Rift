# Implementation Plan: Admin API

## Overview

Implement the Ayola Foods KE Admin API as Next.js 16 Route Handlers under `website/src/app/api/admin/`, backed by Supabase with service role auth, Zod validation, and TypeScript. Tasks are ordered: DB migrations → shared lib → route handlers by domain → notification wiring → M-Pesa initiate.

## Tasks

- [x] 1. Create database migration files
  - Create `website/supabase/step2_notifications.sql` with the `notifications` table DDL, indexes on `created_at DESC` and `is_read`
  - Create `website/supabase/step3_settings.sql` with the `store_settings` single-row table DDL, seed insert, and `updated_at` trigger
  - _Requirements: 24.1, 24.2, 24.3, 28.1, 28.2, 32.1, 32.2, 32.3, 32.4_

- [x] 2. Implement shared lib — types, response helpers, and service client
  - [x] 2.1 Create `website/src/lib/admin/types.ts` with `OrderStatus`, `PaymentStatus`, `NotificationType`, `AdminRole`, `AdminProfile`, `PaginatedResponse` types and `ORDER_STATUS_SEQUENCE`, `TERMINAL_STATUSES` constants
  - [x] 2.2 Create `website/src/lib/admin/response.ts` with `ok()` and `err()` envelope helpers and `ErrorCode` union type
  - [x] 2.3 Create `website/src/lib/admin/supabase.ts` with `getAdminClient()` using `SUPABASE_SERVICE_ROLE_KEY`
  - [x] 2.4 Write property tests for response helpers
    - **Property 1: Response Envelope Mutual Exclusivity** — `ok()` always produces `{ data: <non-null>, error: null }` and `err()` always produces `{ data: null, error: <non-null> }`
    - **Property 2: Error Code to HTTP Status Mapping** — `err(msg, code, status)` HTTP status matches canonical mapping for all `ErrorCode` values
    - **Validates: Requirements 1.1, 1.2, 1.3**
  - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

- [x] 3. Implement shared lib — pagination helper
  - [x] 3.1 Create `website/src/lib/admin/pagination.ts` with `parsePagination()` and `paginatedResponse()` functions
  - [x] 3.2 Write property tests for pagination helpers
    - **Property 4: Pagination Total Pages Invariant** — `Math.ceil(N / P)` for all valid N and P
    - **Property 5: Per-Page Clamping** — any `per_page > 100` is clamped to 100
    - **Validates: Requirements 3.2, 3.3**
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Implement shared lib — session guard
  - [x] 4.1 Create `website/src/lib/admin/auth.ts` with `requireAdminSession(request, requiredRole?)` that validates cookie session, fetches profile via service client, enforces role, and calls `signOut()` on invalid roles
  - [x] 4.2 Write property tests for session guard
    - **Property 3: Session Guard Role Enforcement** — any role value not in `['admin', 'kitchen']` must produce a 403 response and never return an `AdminSession`
    - **Validates: Requirements 2.3, 2.4, 2.6**
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Implement shared lib — status transition logic and notification helper
  - [x] 5.1 Create `website/src/lib/admin/status.ts` with `isValidStatusTransition()` function and `ORDER_STATUS_SEQUENCE` / `TERMINAL_STATUSES` exports
  - [x] 5.2 Write property tests for status transitions
    - **Property 8: Forward-Only Status Transitions** — transition valid iff S not terminal AND (N = 'cancelled' OR index(N) > index(S))
    - **Property 9: Terminal Orders Cannot Be Updated** — any transition from 'delivered' or 'cancelled' returns false
    - **Validates: Requirements 12.3, 12.6**
  - [x] 5.3 Create `website/src/lib/admin/notifications.ts` with `createNotification(type, title, message, orderId?)` that inserts into the `notifications` table
  - [x] 5.4 Write unit tests for notification helper
    - Test `createNotification` inserts a row with correct fields (Property 13 round-trip)
    - **Property 13: Notification Round Trip** — inserted row matches all passed arguments
    - **Validates: Requirements 26.1**
  - _Requirements: 12.3, 12.6, 26.1_

- [x] 6. Checkpoint — Ensure all shared lib tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement auth route handlers
  - [x] 7.1 Create `website/src/app/api/admin/auth/login/route.ts` — POST: Zod validate email+password, `signInWithPassword`, check profile role, return `{ id, email, full_name, role }` or appropriate error
  - [x] 7.2 Create `website/src/app/api/admin/auth/logout/route.ts` — POST: require session, `signOut()`, return `{ success: true }`
  - [x] 7.3 Create `website/src/app/api/admin/auth/me/route.ts` — GET: require session, return profile fields
  - [x] 7.4 Write unit tests for auth routes
    - Test login success (200), wrong password (401), non-admin role (403), Zod failure (422)
    - Test logout success, /me returns correct profile
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 6.1, 6.2**
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2_

- [x] 8. Implement dashboard route handlers
  - [x] 8.1 Create `website/src/app/api/admin/dashboard/stats/route.ts` — GET: `Promise.all` four aggregate queries (total orders, revenue sum, pending count, customer count)
  - [x] 8.2 Create `website/src/app/api/admin/dashboard/revenue/route.ts` — GET: parse `days` param (default 14, max 90), return `{ date, revenue_kes }[]` for completed orders
  - [x] 8.3 Create `website/src/app/api/admin/dashboard/order-status-summary/route.ts` — GET: GROUP BY status, return `{ status, count }[]`
  - [x] 8.4 Write unit tests for dashboard routes
    - Test stats returns all four fields; revenue clamps days to 90; order-status-summary covers all statuses
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 9.1**
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 9.1_

- [x] 9. Implement orders list and detail route handlers
  - [x] 9.1 Create `website/src/app/api/admin/orders/route.ts` — GET: paginated orders list with filters (`status`, `payment_status`, `delivery_type`, `from`, `to`, `q`), compute `item_count` via subquery
  - [x] 9.2 Create `website/src/app/api/admin/orders/[id]/route.ts` — GET: full order + `order_items` join; DELETE: admin-only, guard `status = 'cancelled'`, hard-delete
  - [x] 9.3 Write unit tests for orders list and detail
    - Test list pagination, filter by status, 404 on missing order, delete non-cancelled returns 409
    - **Validates: Requirements 10.1, 10.2, 10.3, 11.1, 11.2, 15.1, 15.2, 15.3**
  - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 15.1, 15.2, 15.3_

- [x] 10. Implement order status update and cancel route handlers
  - [x] 10.1 Create `website/src/app/api/admin/orders/[id]/status/route.ts` — PATCH: Zod validate status enum, call `isValidStatusTransition`, set `confirmed_at`/`completed_at` timestamps, return updated order
  - [x] 10.2 Create `website/src/app/api/admin/orders/[id]/cancel/route.ts` — POST: admin-only, set `status = 'cancelled'`, append reason to `order_notes`, set `payment_status = 'refunded'` if completed, call `createNotification`
  - [x] 10.3 Write unit tests for order status and cancel
    - Test forward transition success, backward transition 409, terminal order 409, kitchen cancels 403, cancel with refund, cancel notification emitted
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 13.1, 13.2, 13.3, 26.5**
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 13.1, 13.2, 13.3, 26.5_

- [x] 11. Implement bulk order status route handler
  - [x] 11.1 Create `website/src/app/api/admin/orders/bulk-status/route.ts` — POST: admin-only, Zod validate (max 50 IDs, status in `confirmed|cancelled`), skip terminal orders, wrap in transaction, return `{ updated, skipped, skipped_ids }`
  - [x] 11.2 Write property tests for bulk status
    - **Property 10: Bulk Update Count Invariant** — `updated + skipped` always equals the number of input IDs
    - **Validates: Requirements 14.1, 14.4**
  - [x] 11.3 Write unit tests for bulk status
    - Test >50 IDs returns 422, terminal orders skipped, transaction rollback on error
    - **Validates: Requirements 14.2, 14.3, 14.4, 14.5, 14.6**
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 12. Checkpoint — Ensure all order route tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement products route handlers
  - [x] 13.1 Create `website/src/app/api/admin/products/route.ts` — GET: paginated products with `category_name` join, include inactive, filters (`q`, `category_id`, `in_stock`, `is_active`); POST: admin-only, Zod validate, check slug conflict, insert, return 201
  - [x] 13.2 Create `website/src/app/api/admin/products/[id]/route.ts` — GET: single product by UUID; PUT: admin-only full replace; PATCH: admin-only partial update; DELETE: admin-only, check `order_items`, soft-delete or hard-delete
  - [x] 13.3 Write property tests for product delete guard
    - **Property 11: Product Delete Guard** — any product with ≥1 `order_items` row must be soft-deleted (not hard-deleted)
    - **Validates: Requirements 18.3, 18.4**
  - [x] 13.4 Write unit tests for products routes
    - Test create with slug conflict (409), create defaults, GET 404, PUT replaces all fields, PATCH updates partial, DELETE hard vs soft
    - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4, 18.1, 18.2, 18.3, 18.4, 18.5**
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 17.1, 17.2, 17.3, 17.4, 18.1, 18.2, 18.3, 18.4, 18.5_

- [x] 14. Implement categories route handlers
  - [x] 14.1 Create `website/src/app/api/admin/categories/route.ts` — GET: all categories ordered by `sort_order`, include `product_count`; POST: admin-only, Zod validate, insert, return 201
  - [x] 14.2 Create `website/src/app/api/admin/categories/[id]/route.ts` — GET: single category; PUT: admin-only full replace; DELETE: admin-only, guard products exist, hard-delete or 409
  - [x] 14.3 Write property tests for category delete guard
    - **Property 12: Category Delete Guard** — any category with ≥1 product must return 409 and not be deleted
    - **Validates: Requirements 19.6**
  - [x] 14.4 Write unit tests for categories routes
    - Test list order, product_count, POST slug conflict, DELETE with products (409), DELETE without products (200)
    - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8**
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8_

- [x] 15. Implement customers route handlers
  - [x] 15.1 Create `website/src/app/api/admin/customers/route.ts` — GET: paginated profiles with `order_count` and `total_spent` aggregates, filter by `q` and `role`
  - [x] 15.2 Create `website/src/app/api/admin/customers/[id]/route.ts` — GET: profile + orders (max 200) + stats (`order_count`, `total_spent_kes`, `first_order_at`, `last_order_at`); 404 if not found
  - [x] 15.3 Create `website/src/app/api/admin/customers/[id]/role/route.ts` — PATCH: admin-only, Zod validate role enum, guard self-change, update profile
  - [x] 15.4 Write property tests for self-role modification guard
    - **Property 15: Self-Role Modification Forbidden** — session user changing their own role must always return 4xx and not modify the profile
    - **Validates: Requirements 21.3**
  - [x] 15.5 Write unit tests for customers routes
    - Test list pagination, detail 404, role update self-change 403, role update valid
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 21.1, 21.2, 21.3, 21.4**
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 21.1, 21.2, 21.3, 21.4_

- [x] 16. Implement payments route handlers
  - [x] 16.1 Create `website/src/app/api/admin/payments/route.ts` — GET: paginated orders with payment fields, filters (`q`, `payment_method`, `payment_status`, `from`, `to`)
  - [x] 16.2 Create `website/src/app/api/admin/payments/[orderId]/logs/route.ts` — GET: `payment_logs` for order ordered by `created_at DESC`; 404 if order missing
  - [x] 16.3 Create `website/src/app/api/admin/payments/mpesa/status/[checkoutRequestId]/route.ts` — GET: call `querySTKStatus`, return raw response
  - [x] 16.4 Write unit tests for payments routes
    - Test list filters, logs 404 on missing order, STK status proxies response
    - **Validates: Requirements 22.1, 22.2, 22.3, 22.4, 23.1**
  - _Requirements: 22.1, 22.2, 22.3, 22.4, 23.1_

- [x] 17. Implement notifications route handlers
  - [x] 17.1 Create `website/src/app/api/admin/notifications/route.ts` — GET: paginated notifications ordered by `created_at DESC`, `is_read` filter, include `unread_count` in response
  - [x] 17.2 Create `website/src/app/api/admin/notifications/unread-count/route.ts` — GET: COUNT where `is_read = false`
  - [x] 17.3 Create `website/src/app/api/admin/notifications/[id]/read/route.ts` — PATCH: set `is_read = true`, return `{ updated: true }`
  - [x] 17.4 Create `website/src/app/api/admin/notifications/read-all/route.ts` — POST: UPDATE all to `is_read = true`, return `{ updated_count: N }`
  - [x] 17.5 Write unit tests for notifications routes
    - Test list includes unread_count, mark read, read-all returns count, unread-count endpoint
    - **Validates: Requirements 25.1, 25.2, 25.3, 25.4, 25.5**
  - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_

- [x] 18. Implement settings route handlers
  - [x] 18.1 Create `website/src/app/api/admin/settings/route.ts` — GET: return `store_settings` row; PATCH: admin-only, Zod partial validate, update provided fields
  - [x] 18.2 Create `website/src/app/api/admin/settings/invite/route.ts` — POST: admin-only, validate email+role, `inviteUserByEmail`, upsert profile, return 201
  - [x] 18.3 Create `website/src/app/api/admin/settings/users/[id]/route.ts` — DELETE: admin-only, guard self-demotion, set `role = 'customer'`
  - [x] 18.4 Create `website/src/app/api/admin/settings/test-mpesa/route.ts` — POST: admin-only, call `getOAuthToken`, return `{ success, environment, message }`
  - [x] 18.5 Write unit tests for settings routes
    - Test PATCH updates only provided fields, invite creates profile, self-demotion 400, test-mpesa success and failure paths
    - **Validates: Requirements 29.1, 29.2, 29.3, 30.1, 30.2, 30.3, 30.4, 31.1, 31.2, 31.3**
  - _Requirements: 29.1, 29.2, 29.3, 30.1, 30.2, 30.3, 30.4, 31.1, 31.2, 31.3_

- [x] 19. Checkpoint — Ensure all route handler tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Wire notification side effects into existing order and M-Pesa routes
  - [x] 20.1 Update `website/src/app/api/orders/route.ts` (customer-facing) — call `createNotification('new_order', 'New Order #[order_number]', ...)` after successful order insert
  - [x] 20.2 Update `website/src/app/api/payments/mpesa/callback/route.ts` — call `createNotification('payment_completed', ...)` on `ResultCode = 0` and `createNotification('payment_failed', ...)` on non-zero `ResultCode`
  - [x] 20.3 Write unit tests for notification side effects
    - Test new order route emits `new_order` notification, callback emits `payment_completed` on success and `payment_failed` on failure
    - **Validates: Requirements 26.2, 26.3, 26.4**
  - _Requirements: 26.2, 26.3, 26.4_

- [x] 21. Implement customer-facing M-Pesa initiate route
  - [x] 21.1 Create `website/src/app/api/payments/mpesa/initiate/route.ts` — POST: no admin auth, Zod validate `order_id` + `phone`, normalise phone to `2547XXXXXXXX`, check order exists and `payment_status = 'pending'`, call `initiateSTKPush`, update order with `mpesa_checkout_request_id` and `payment_status = 'processing'`, insert `payment_logs` row
  - [x] 21.2 Write property tests for phone normalisation
    - **Property 14: Phone Normalisation** — `07XXXXXXXX`, `+2547XXXXXXXX`, and `2547XXXXXXXX` all normalise to exactly `2547XXXXXXXX`
    - **Validates: Requirements 27.2**
  - [x] 21.3 Write unit tests for M-Pesa initiate route
    - Test 503 when not configured, 422 when order not pending, 422 when order not found, success path updates order and inserts log
    - **Validates: Requirements 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7**
  - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7_

- [x] 22. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property tests use `fast-check` with `numRuns: 100` and include a comment tag `// Feature: admin-api, Property N: <text>`
- All route handlers use `if (session instanceof Response) return session;` after calling `requireAdminSession`
- Notifications are fire-and-forget — do not `await` them in the primary response path
- The service role key must never appear in any HTTP response body
