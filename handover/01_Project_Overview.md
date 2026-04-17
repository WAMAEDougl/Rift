# 01 — Project Overview

**Ayola Foods KE — Full-Stack E-Commerce & Restaurant Website**

---

## 1. What Was Built

Ayola Foods KE now has a complete digital platform consisting of two parts:

### 1.1 Public-Facing Website
A marketing and e-commerce website at **ayolafoods.com** that allows customers to:
- Browse all products and meal categories
- Read about Ayola's story, mission, and the founder
- Place orders online (with M-Pesa or Cash on Delivery)
- Track their orders
- Read recipes, health articles, and join the community
- Contact the team and visit the restaurant location

### 1.2 Admin Dashboard
A private management panel at **/admin** that allows Ayola staff to:
- Monitor orders in real time
- Update order statuses through the fulfillment pipeline
- Manage products, prices, and categories
- View customer profiles and order histories
- Monitor all payments including M-Pesa receipts
- Receive in-app notifications for new orders and payments
- Configure store settings and M-Pesa credentials

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) | Server-side rendering, routing, API routes |
| **Language** | TypeScript | Type-safe code throughout |
| **Styling** | Tailwind CSS v4 + shadcn/ui | Responsive design components |
| **Animation** | Framer Motion | Page transitions and micro-animations |
| **Database** | Supabase (PostgreSQL) | All data storage |
| **Authentication** | Supabase Auth | Customer + admin login |
| **File Storage** | Supabase Storage | Product image uploads |
| **Payment Gateway** | Safaricom Daraja API (M-Pesa) | STK Push payments |
| **Hosting** | Vercel | Automatic deployments from Git |
| **Containerization** | Docker | Optional self-hosted deployment |
| **Validation** | Zod | API request and form validation |

---

## 3. Site Architecture

```
ayolafoods.com/
├── /                        ← Homepage (hero, stats, categories, values, founder, testimonials)
├── /products                ← Product catalogue (filterable by category, searchable)
├── /products/[slug]         ← Individual product detail pages
├── /cart                    ← Cart page (also accessible via slide-out sidebar)
├── /checkout                ← Checkout (contact + delivery + payment)
├── /orders/success          ← Post-checkout order confirmation page
├── /orders/track            ← Order tracking by Order ID
├── /about                   ← Founder story, mission, vision, brand values (with timeline)
├── /health-hub              ← Health & nutrition educational articles
├── /blog                    ← Blog listing
├── /blog/[slug]             ← Individual blog post pages
├── /recipes                 ← Recipe library listing
├── /recipes/[slug]          ← Individual recipe detail pages
├── /community               ← WhatsApp/Facebook community, customer stories, newsletter
├── /contact                 ← Contact form & business details
├── /faq                     ← Frequently asked questions
├── /wholesale               ← B2B/wholesale enquiry form (sends via WhatsApp)
├── /visit-us                ← Restaurant location, operating hours, Google Maps, directions
├── /privacy                 ← Privacy policy
├── /terms                   ← Terms & conditions
├── /returns                 ← Returns policy
├── /sitemap.xml             ← Auto-generated sitemap (SEO)
├── /robots.txt              ← Search engine crawler rules
├── /admin/login             ← Admin login gate
└── /admin/...               ← Admin dashboard (protected)
```

---

## 4. Application Highlights

### 4.1 Products & Categories
- **4 product categories:** Meals, Beverages, Packaged Products, Flour Blends
- Products managed in Supabase and served dynamically via API
- Product pages include nutrition highlights, ingredients, features, and size info
- Supports "ships countrywide" flag per category
- Search modal in the navbar for quick product lookup

### 4.2 Ordering System
- Full cart system with slide-out sidebar, persists across pages
- Checkout collects: customer name, phone, email, delivery address, city, delivery type, order notes
- Payment options: M-Pesa STK Push (to customer's phone) or Cash on Delivery
- Real-time M-Pesa callback processing via Safaricom Daraja API
- Automatic order number generation (`AYF-XXXXXX` format)
- Post-checkout success page + order tracking page (`/orders/track`)

### 4.3 Content Pages
- **About** — Full founder story (Prisca Kiragu, JKUAT Food Scientist), company timeline, brand values (Urithi, Lishe, Ubora, Jamii, Ubunifu, Uaminifu)
- **Community** — WhatsApp community join, Facebook community, customer stories, social links, newsletter signup
- **Visit Us** — Google Maps embed, operating hours (Mon–Fri 7AM–8PM, Sat 7AM–8PM, Sun 8AM–6PM), step-by-step directions
- **Wholesale** — B2B enquiry form that sends via WhatsApp; targets supermarkets, schools, hotels, corporates
- **Health Hub, Blog, Recipes** — each with individual dynamic detail pages

### 4.4 Admin Dashboard
- Role-based access: `admin` (full access) and `kitchen` (orders only, cannot cancel)
- Order status pipeline: **Pending → Confirmed → Preparing → Ready → Dispatched → Delivered**
- Bulk actions: mark multiple orders confirmed or cancelled at once
- Notification bell polls every 30 seconds for new orders/payments

### 4.5 Security
- All `/admin/*` UI routes protected by server-side session check
- All `/api/admin/*` routes require valid admin/kitchen session
- M-Pesa service role key is **never exposed** to the browser
- Supabase Row Level Security (RLS) enabled
- Zod validation on all API inputs

---

## 5. Key Contacts & Credentials

> ⚠️ **IMPORTANT:** Credentials are stored in the `.env` file on the server / Vercel dashboard. They are NOT committed to the Git repository.

| Service | Where to find credentials |
|---|---|
| **Supabase** | Supabase Dashboard → Project Settings → API |
| **M-Pesa (Daraja)** | Safaricom Developer Portal (developer.safaricom.co.ke) |
| **Vercel** | vercel.com → Ayola Foods project → Settings → Environment Variables |
| **Admin logins** | Created manually in Supabase Auth → Users |

---

## 6. Version & Scope Notes

> **Version 1 (current)**
> - M-Pesa refunds are out of scope — refund status is a flag only; actual refunds are manual.
> - Notifications use 30-second polling. Real-time (Supabase Realtime) is planned for v2.
> - No customer-facing account portal in v1 (order tracking is by order ID only).
> - No \"Forgot password\" flow in v1 for admin — accounts are reset via Supabase dashboard.
