# Rift & Root — Admin & Storefront

Heritage African meals, probiotic beverages, and pantry goods hand-crafted in small batches in Nairobi, Kenya.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + hardcoded admin fallback
- **Payments**: Safaricom M-Pesa Daraja API (STK Push)
- **WhatsApp**: WaSender REST API
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Fonts**: Fraunces (display) + Plus Jakarta Sans (body)

---

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel (protected)
│   │   ├── (protected)/    # Dashboard, Orders, Products, Categories,
│   │   │                   # Customers, Payments, Notifications, Settings
│   │   ├── login/          # Admin login page
│   │   └── layout.tsx      # Admin shell (overlays public site)
│   ├── api/
│   │   ├── admin/          # Protected admin API routes
│   │   └── ...             # Public API routes (orders, payments, etc.)
│   ├── shop/               # Customer-facing shop
│   ├── checkout/           # Checkout flow
│   ├── products/           # Product catalogue & detail pages
│   └── ...                 # About, Blog, Recipes, Contact, etc.
├── components/
│   ├── admin/              # AdminSidebar, AdminTopbar, StatusBadge
│   ├── site/               # Header, Footer
│   └── ui/                 # shadcn/ui components
└── lib/
    ├── admin/              # Auth, formatters, pagination, response helpers
    ├── supabase/           # Client, server, middleware helpers
    ├── mpesa.ts            # Safaricom Daraja STK Push integration
    ├── wasender.ts         # WaSender WhatsApp API integration
    └── ...
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/WAMAEDougl/Rift.git
cd Rift/the-rift-main
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_MPESA_PAYBILL` | M-Pesa paybill or till number |
| `MPESA_CONSUMER_KEY` | Safaricom Daraja consumer key |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja consumer secret |
| `MPESA_SHORTCODE` | M-Pesa shortcode |
| `MPESA_PASSKEY` | M-Pesa passkey |
| `MPESA_CALLBACK_URL` | Public URL for M-Pesa payment callbacks |
| `WASENDER_API_TOKEN` | WaSender API token for WhatsApp messaging |
| `WASENDER_API_BASE_URL` | WaSender base URL (default: `https://app.wasender.app/api`) |

### 4. Set up the database

Run the migrations in your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or manually run the SQL files in order:
# supabase/migrations/001_initial_schema.sql
# supabase/migrations/002_notifications.sql
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront.

---

## Admin Panel

Access the admin panel at `/admin`.

### Default credentials (development only)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@riftandroot.com` | `Admin@1234` |
| Kitchen | `kitchen@riftandroot.com` | `Kitchen@1234` |

> **Note:** These are hardcoded for development. Connect Supabase Auth and update `src/app/api/admin/auth/login/route.ts` before going to production.

### Admin modules

| Module | Path | Description |
|---|---|---|
| Dashboard | `/admin` | KPIs, modules grid, recent orders |
| Orders | `/admin/orders` | Manage & fulfil orders, bulk actions |
| Order Detail | `/admin/orders/[id]` | WhatsApp thread, STK Push panel |
| Products | `/admin/products` | Catalogue, stock toggles |
| New Product | `/admin/products/new` | Create product with image upload |
| Edit Product | `/admin/products/[id]/edit` | Edit existing product |
| Categories | `/admin/categories` | Create, edit, delete categories |
| Customers | `/admin/customers` | Customer list with order history |
| Payments | `/admin/payments` | Transaction logs & M-Pesa receipts |
| Notifications | `/admin/notifications` | Mark read, filter by status |
| Settings | `/admin/settings` | Store config, team invites |

---

## Checkout Flow

The checkout is WhatsApp-first:

1. Customer fills in their name and **WhatsApp phone number**
2. Order is created in the database
3. An automated WhatsApp confirmation is sent via WaSender
4. Admin views the order, negotiates delivery fee via WhatsApp thread
5. Admin sends an M-Pesa STK Push from the order detail page with the agreed total
6. Customer pays → M-Pesa callback fires → WhatsApp payment confirmation sent

---

## Key Features

- **WhatsApp-first checkout** — no upfront payment, negotiate delivery via WhatsApp
- **Admin STK Push** — send M-Pesa payment requests with custom delivery fee from the admin panel
- **WhatsApp thread** — view and reply to customer messages directly in the order detail page
- **Dark mode** — full dark/light theme support
- **Responsive** — mobile-first design throughout
- **Image upload** — product images uploaded to Supabase Storage
- **Real-time inventory** — stock alerts on the admin dashboard

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run test       # Run tests (Vitest)
```

---

## License

Private — Rift & Root Kenya. All rights reserved.
