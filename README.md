# Ayola Foods KE

Kenya's first health-food restaurant and packaged products brand. A food ordering system with customer-facing website and admin dashboard.

## Project Overview

- **Customer side** — `ayolafoods.com` (browse products, order, pay via M-Pesa)
- **Admin side** — `/admin` (manage orders, update statuses, view customers)

Both share the same Supabase backend and database.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16, App Router, TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Validation | Zod |
| Payments | M-Pesa Daraja API |
| Animations | Framer Motion |

## Prerequisites

- **Node.js** >= 20.x
- **Yarn** >= 1.22.x (`corepack enable` or `npm i -g yarn`)
- **Supabase** project (free tier on [supabase.com](https://supabase.com))
- **M-Pesa Daraja** developer account (sandbox on [developer.safaricom.co.ke](https://developer.safaricom.co.ke))

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/your-org/ayolafoods.com.git
cd ayolafoods.com
```

### 2. Set up environment variables

```bash
cp website/.env.example website/.env
```

Edit `website/.env` with your credentials (see [Environment Variables](#environment-variables)).

### 3. Set up the database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the migration files in order:
   - `supabase/step0_clean_slate.sql`
   - `supabase/step1_tables.sql`
   - `supabase/step2_rls_and_seed.sql`
   - `supabase/step2_notifications.sql`
   - `supabase/step2_fix.sql`
   - `supabase/step3_settings.sql`
   - `supabase/step3_grant_access.sql`
   - `supabase/seed.sql`
   - `supabase/seed_orders.sql`

Alternatively, run `supabase/run_this_in_dashboard.sql` for a single-command setup.

### 4. Install dependencies

```bash
cd website
yarn install
```

### 5. Start the dev server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
yarn build
yarn start
```

## Environment Variables

All variables go in `website/.env`.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `MPESA_CONSUMER_KEY` | M-Pesa Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | M-Pesa Daraja consumer secret |
| `MPESA_SHORTCODE` | M-Pesa Paybill/Till number |
| `MPESA_PASSKEY` | M-Pesa Lipa Na M-Pesa passkey |
| `MPESA_ENVIRONMENT` | `sandbox` or `production` |

## Repository Structure

```
ayolafoods.com/
├── website/                    ← Next.js application
│   ├── src/
│   │   ├── app/                ← Pages (customer + admin) and API routes
│   │   ├── components/         ← UI components (customer + admin)
│   │   ├── lib/                ← Supabase clients, helpers, data
│   │   └── types/              ← TypeScript type definitions
│   ├── supabase/               ← SQL migrations and seed data
│   └── public/                 ← Static assets
└── docs/                       ← Business documents (reference only)
```

## Key Files

| Purpose | Path |
|---|---|
| Database schema | `website/supabase/step1_tables.sql` |
| Run migrations | `website/supabase/run_this_in_dashboard.sql` |
| Supabase server client | `website/src/lib/supabase/server.ts` |
| Supabase browser client | `website/src/lib/supabase/client.ts` |
| TypeScript types | `website/src/lib/supabase/types.ts` |
| Route middleware | `website/src/middleware.ts` |
| Order API | `website/src/app/api/orders/route.ts` |
| M-Pesa helpers | `website/src/lib/mpesa.ts` |

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start Next.js dev server with Turbopack |
| `yarn build` | Production build with TypeScript check |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn test` | Run Vitest tests |

## Admin Access

Admin routes are protected behind Supabase Auth. To grant admin access:

1. Ensure an admin user is created via Supabase Auth
2. Set the user's `role` to `admin` or `kitchen` in the `profiles` table
3. Admin pages live under `/admin/*`

## Order Statuses

The `orders.status` column accepts: `pending`, `confirmed`, `preparing`, `ready`, `dispatched`, `delivered`, `cancelled`

Admin dashboard maps these to: **NEW** (pending/confirmed), **IN_PROGRESS** (preparing/ready/dispatched), **COMPLETED** (delivered/cancelled)

## Running Tests

```bash
cd website
yarn test
```

Tests are located in `src/lib/admin/__tests__/` and cover admin auth, notifications, and order management logic.
