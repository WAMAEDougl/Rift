# Ayola Foods KE — Agent Instructions

This is a case study project, not a production system. Read this file fully before writing any code.

## What This Project Is

A food ordering system with two interfaces:
- **Customer side** — `ayolafoods.com` (the Next.js website in `/website`)
- **Admin side** — `/admin` (internal dashboard, currently being built)

Same backend. Same database. One order flow.

## Project Status

The customer-facing website is essentially complete. Do not touch it unless you are fixing a confirmed bug in the order flow.

What is missing and needs to be built:
1. `/admin/login` — admin authentication page
2. `/admin/orders` — orders list dashboard
3. `/admin/orders/[id]` — order detail + status update
4. `/api/admin/orders` — admin API routes (protected)
5. `/api/payments/mpesa/initiate` — M-Pesa STK push initiation
6. `.env.example` — environment variable template

## Non-Negotiable Rules

### Do Not Overbuild
- Build only what is listed above or explicitly requested
- Do not add features, pages, components, or utilities that are not required
- Do not refactor existing code unless it is directly blocking your task
- Do not add comments, docstrings, or type annotations to code you did not write

### Do Not Modify These Unless Directed
- `src/app/(customer-facing pages)` — homepage, products, cart, checkout, orders/track, blog, etc.
- `src/lib/products.ts` — product data
- `src/lib/cart-context.tsx` — cart state
- `supabase/*.sql` — database schema files (coordinate with the DB lead before touching)
- `middleware.ts` — only the admin auth dev should update this

### One Order Flow
There is one checkout flow. Do not create an alternative. Do not change the order submission logic unless you are specifically fixing it.

### No New Dependencies
Do not add npm packages without team discussion. The stack (Next.js, Tailwind, shadcn/ui, Supabase, Zod, Framer Motion) is sufficient for everything required.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Validation | Zod |
| Payments | M-Pesa Daraja API |

## Repo Structure

```
ayolafoods.com/
├── website/          ← Next.js application (work here)
│   ├── src/
│   │   ├── app/      ← Pages and API routes
│   │   ├── components/
│   │   ├── lib/      ← Supabase client, helpers, data
│   │   └── types/
│   └── supabase/     ← DB migration SQL files
└── docs/             ← Business documents (do not touch)
```

## Key Files

| Purpose | Path |
|---|---|
| DB schema | `website/supabase/step1_tables.sql` |
| Supabase server client | `website/src/lib/supabase/server.ts` |
| Supabase browser client | `website/src/lib/supabase/client.ts` |
| Supabase TypeScript types | `website/src/lib/supabase/types.ts` |
| Route protection | `website/src/middleware.ts` |
| Existing order API | `website/src/app/api/orders/route.ts` |
| M-Pesa helpers | `website/src/lib/mpesa.ts` |

## Environment Variables

Required. See `.env.example` once it is created.

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MPESA_CONSUMER_KEY
MPESA_CONSUMER_SECRET
MPESA_SHORTCODE
MPESA_PASSKEY
MPESA_ENVIRONMENT        (sandbox | production)
```

## Definition of Done

The case study is complete when:
1. A customer can place an order from the site
2. The order is saved in the database
3. An admin can log into `/admin` and see the order
4. The admin can open the order and read all details
5. The admin can update the order status

Do not ship anything beyond this.
