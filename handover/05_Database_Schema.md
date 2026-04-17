# 05 — Database Schema

**Audience:** Developers  
**Database:** Supabase (PostgreSQL)  
**Migration files:** `website/supabase/`

---

## 1. Overview

The database has **8 core tables** (plus Supabase Auth's built-in `auth.users`):

```
auth.users          ← Supabase built-in (authentication)
  └── profiles      ← Extended user data (name, phone, role, address)

categories          ← Product categories
  └── products      ← Product catalogue
        └── order_items  ← Line items in an order

orders              ← Customer orders
  ├── order_items   ← Line items (FK to orders + products)
  └── payment_logs  ← Raw M-Pesa event log

notifications       ← Admin in-app notifications
store_settings      ← Single-row store configuration table
```

---

## 2. Table Definitions

### `public.profiles`

Extended user profile. Auto-created on Supabase Auth signup via trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | References `auth.users(id)` ON DELETE CASCADE |
| `full_name` | text | Customer or admin's name |
| `phone` | text | Phone number |
| `email` | text | Email address |
| `role` | text | `'customer'` \| `'admin'` \| `'kitchen'` — default `'customer'` |
| `default_address` | text | Saved delivery address |
| `default_city` | text | Default: `'Nairobi'` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

**Trigger:** `on_auth_user_created` — inserts a new profile row whenever a user signs up.

---

### `public.categories`

Product categories (e.g., Meals, Beverages, Packaged, Flour Blends).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `slug` | text (UNIQUE) | URL-safe identifier |
| `name` | text | Display name |
| `tagline` | text | Short description |
| `icon` | text | Text/emoji icon |
| `description` | text | Full description |
| `color` | text | Hex colour for card gradient |
| `bg_color` | text | Hex colour for card background |
| `ships_countrywide` | boolean | Default: `false` |
| `price_from` | integer | Starting price shown on category card |
| `sort_order` | integer | Display order — lower first |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

---

### `public.products`

Product catalogue.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `legacy_id` | text (UNIQUE) | Legacy identifier for imported products |
| `slug` | text (UNIQUE) | URL-safe identifier |
| `name` | text | Product display name |
| `category_id` | uuid (FK) | References `categories(id)` |
| `description` | text | Short description (product cards) |
| `long_description` | text | Full product page description |
| `price` | integer | Price in KES (not cents) |
| `size` | text | e.g., "500g", "1L", "2kg" |
| `image_url` | text | URL of product image |
| `features` | text[] | Array of feature tags |
| `ingredients` | text | Ingredients list |
| `nutrition_highlights` | text[] | Array of nutrition tags |
| `badge` | text | e.g., "New", "Best Seller" |
| `in_stock` | boolean | Default: `true` |
| `is_active` | boolean | Default: `true`. If false, hidden from public site. |
| `sort_order` | integer | Display order |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |

**Indexes:** `category_id`, `slug`

---

### `public.orders`

Customer orders.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_number` | text (UNIQUE) | e.g., `AYF-001234` |
| `customer_id` | uuid (FK) | References `profiles(id)`. Nullable (guest orders). |
| `status` | text | `pending` \| `confirmed` \| `preparing` \| `ready` \| `dispatched` \| `delivered` \| `cancelled` |
| `customer_name` | text | |
| `customer_phone` | text | |
| `customer_email` | text | Nullable |
| `delivery_address` | text | |
| `delivery_city` | text | Default: `'Nairobi'` |
| `delivery_type` | text | `delivery` \| `pickup` \| `shipping` |
| `order_notes` | text | Nullable — customer notes |
| `subtotal` | integer | Sum of line items in KES |
| `delivery_fee` | integer | Delivery fee in KES |
| `total` | integer | `subtotal + delivery_fee` in KES |
| `payment_method` | text | `mpesa` \| `cash_on_delivery` |
| `payment_status` | text | `pending` \| `processing` \| `completed` \| `failed` \| `refunded` |
| `mpesa_checkout_request_id` | text | Safaricom STK push request ID |
| `mpesa_receipt_number` | text | Safaricom payment receipt number |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated by trigger |
| `confirmed_at` | timestamptz | Set when status → `confirmed` |
| `completed_at` | timestamptz | Set when status → `delivered` |

**Indexes:** `customer_id`, `order_number`, `status`

---

### `public.order_items`

Individual line items within an order.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK) | References `orders(id)` ON DELETE CASCADE |
| `product_id` | uuid (FK) | References `products(id)` |
| `product_name` | text | Snapshot of name at time of order |
| `product_price` | integer | Snapshot of price at time of order |
| `quantity` | integer | Must be > 0 |
| `line_total` | integer | `product_price × quantity` |

**Index:** `order_id`

> **Important:** `product_name` and `product_price` are **snapshots** — they reflect what the product was when the order was placed, not the current product values. This ensures order history is accurate even if prices change.

---

### `public.payment_logs`

Raw log of M-Pesa payment events. Append-only (no updates/deletes).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK) | References `orders(id)`. Nullable. |
| `provider` | text | Always `'mpesa'` currently |
| `event_type` | text | e.g., `stk_push_initiated`, `stk_callback` |
| `raw_payload` | jsonb | The full JSON payload from Safaricom |
| `created_at` | timestamptz | |

---

### `public.notifications`

Admin in-app notification feed.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `type` | text | `new_order` \| `payment_completed` \| `payment_failed` \| `order_cancelled` |
| `title` | text | Short title (e.g., "New Order #AYF-001234") |
| `message` | text | Longer description |
| `order_id` | uuid (FK) | References `orders(id)` ON DELETE SET NULL. Nullable. |
| `is_read` | boolean | Default: `false` |
| `created_at` | timestamptz | |

**Indexes:** `created_at DESC`, `is_read`

**Migration file:** `supabase/step2_notifications.sql`

---

### `public.store_settings`

Single-row configuration table. Enforced by `CHECK (id = 1)`.

| Column | Type | Notes |
|---|---|---|
| `id` | integer (PK) | Always 1 |
| `store_name` | text | Default: `'Ayola Foods KE'` |
| `support_email` | text | |
| `support_phone` | text | |
| `default_delivery_fee` | integer | Default: `150` (KES) |
| `delivery_cities` | text[] | Default: `ARRAY['Nairobi']` |
| `order_notification_emails` | text[] | Default: `'{}'` |
| `updated_at` | timestamptz | |

**Migration file:** `supabase/step3_settings.sql`

---

## 3. Entity Relationship Diagram

```
auth.users
    │
    ▼ (1:1, auto-created)
profiles ──────────────────────┐
    │                          │
    └─── customer_id ──────►  orders (1:many)
                                │
                  ┌─────────────┼─────────────────┐
                  ▼             ▼                  ▼
            order_items    payment_logs      notifications
                  │
                  └── product_id ──► products ──► categories
```

---

## 4. Row Level Security (RLS)

RLS is enabled on all tables. The admin API routes use the **service role** client which bypasses RLS.

Customer-facing API routes use the **anon key** and are subject to RLS policies:

| Table | Customer-facing Access |
|---|---|
| `products` | Read-only, filter `is_active = true` |
| `categories` | Read-only |
| `orders` | Insert own orders; read own orders (matched by `customer_id`) |
| `order_items` | Read own order items |
| `profiles` | Read and update own profile only |
| `payment_logs` | No direct access |
| `notifications` | No access (admin only) |
| `store_settings` | No access (admin only) |

---

## 5. Migration Files

Run these files **in order** in the Supabase SQL editor (or Supabase CLI):

| File | Purpose |
|---|---|
| `supabase/step0_clean_slate.sql` | Drops all existing tables (use only on a fresh DB) |
| `supabase/step1_tables.sql` | Creates all core tables, indexes, and triggers |
| `supabase/step2_notifications.sql` | Creates the `notifications` table |
| `supabase/step2_rls_and_seed.sql` | Sets up Row Level Security policies + seed data |
| `supabase/step3_settings.sql` | Creates the `store_settings` table |
| `supabase/step3_grant_access.sql` | Grants permissions for public access |
| `supabase/seed.sql` | Seeds product and category data |

> ⚠️ **Never run `step0_clean_slate.sql` on a live production database** — it drops everything.

---

## 6. Useful SQL Snippets

**Check all admin/kitchen users:**
```sql
SELECT id, full_name, email, role FROM profiles WHERE role IN ('admin', 'kitchen');
```

**Check unread notifications count:**
```sql
SELECT COUNT(*) FROM notifications WHERE is_read = false;
```

**Order revenue summary:**
```sql
SELECT
  date_trunc('day', created_at) AS day,
  SUM(total) AS revenue_kes,
  COUNT(*) AS order_count
FROM orders
WHERE payment_status = 'completed'
GROUP BY day
ORDER BY day DESC
LIMIT 30;
```

**Find an order by M-Pesa receipt:**
```sql
SELECT * FROM orders WHERE mpesa_receipt_number = 'QHF2XXXXX';
```
