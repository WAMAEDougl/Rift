# Admin Dashboard — Agent Instructions

Read `../../../../../CLAUDE.md` and `../../../CLAUDE.md` first. This file covers admin-specific rules only.

## Scope

You are building the admin dashboard. Nothing else. The pages required are:

| Route | Purpose |
|---|---|
| `/admin/login` | Email/password login form |
| `/admin/orders` | List all orders, newest first |
| `/admin/orders/[id]` | Order detail + status update control |

Do not create any other admin pages or routes.

## Authentication

- Use Supabase Auth (`signInWithPassword`) for the login form
- After login, Supabase sets a session cookie automatically via `@supabase/ssr`
- Use the server Supabase client to verify the session in server components and API routes
- The middleware at `src/middleware.ts` handles redirect of unauthenticated users to `/admin/login`
- After a successful login, redirect to `/admin/orders`
- After logout, redirect to `/admin/login`

### How to Check Auth in a Server Component
```ts
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/admin/login')
```

### How to Check Auth in an API Route
```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

## Admin API Routes

All admin API routes live at `src/app/api/admin/`. Protect every route — no exceptions.

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/orders` | Fetch all orders |
| GET | `/api/admin/orders/[id]` | Fetch single order with items |
| PATCH | `/api/admin/orders/[id]` | Update order status |

### Fetching Orders
Query the `orders` table. Join with `order_items` for the detail view. Use the Supabase server client.

```ts
// All orders
const { data } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })

// Single order with items
const { data } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .eq('id', id)
  .single()
```

### Updating Status
```ts
const { error } = await supabase
  .from('orders')
  .update({ status: newStatus })
  .eq('id', id)
```

Valid status values: `pending`, `confirmed`, `preparing`, `ready`, `dispatched`, `delivered`, `cancelled`

## Orders Dashboard (`/admin/orders`)

Display a table with these columns:
- Order ID (short — first 8 chars of UUID is enough)
- Customer name
- Phone number
- Total amount (KES)
- Status (as a coloured badge)
- Date/time placed

Rows link to the order detail page. Sorted newest first. No pagination required for the case study.

### Status Badge Colours
| Status | Colour |
|---|---|
| pending, confirmed | Yellow |
| preparing, ready, dispatched | Blue |
| delivered | Green |
| cancelled | Red / Gray |

## Order Detail (`/admin/orders/[id]`)

Show:
1. Customer info — name, phone, delivery address, notes
2. Items ordered — product name, quantity, unit price, line total
3. Order total
4. Timestamps — placed at, last updated
5. Status control — allow changing to any valid status

The status control can be a dropdown or a group of buttons. Keep it simple. On change, call `PATCH /api/admin/orders/[id]` and refresh the page data.

## Admin Layout

The admin layout (`layout.tsx` in this directory) should include:
- A simple top navigation bar or sidebar with: "Orders" link and a "Logout" button
- No complex navigation — there is only one section (orders)
- The login page should NOT use this layout (use a separate layout or `export const metadata` only)

## What Not To Build

- No product management (CRUD for products)
- No analytics, charts, or summaries
- No user/staff management
- No settings page
- No bulk order actions
- No export to CSV
- No real-time updates (polling or websockets)
- No pagination (the case study will not have enough orders to need it)
- No image uploads

If you are about to build something not listed in the Scope section above, stop and check with the team lead.
