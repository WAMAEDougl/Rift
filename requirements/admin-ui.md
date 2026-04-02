# Ayola Foods KE — Admin Dashboard UI Requirements

**Document type:** UI / Frontend Specification
**Scope:** Full admin panel — all modules
**Stack:** Next.js 16 (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion
**Base route:** `/admin`

---

## 1. Global Layout

### 1.1 Shell

All admin pages share a persistent shell composed of:

| Region | Description |
|---|---|
| **Sidebar** | Fixed left sidebar, 240px wide. Contains logo, navigation links, and bottom user/logout section. Collapsible to icon-only on smaller screens. |
| **Topbar** | Fixed top bar spanning the content area. Contains page title (dynamic), notification bell with unread badge, and admin avatar/name. |
| **Content area** | Scrollable main area to the right of the sidebar. Padded. |

**Sidebar navigation links (in order):**

1. Dashboard
2. Orders
3. Products
4. Categories
5. Customers
6. Payments
7. Notifications
8. Settings

Active link state: filled background highlight. Unread indicator badge on Orders and Notifications.

### 1.2 Authentication Gate

All `/admin` routes are protected. An unauthenticated visit redirects to `/admin/login`. After login, redirect to `/admin` (dashboard).

### 1.3 Roles

The admin panel respects two roles from the `profiles.role` field:

| Role | Access |
|---|---|
| `admin` | Full access to all modules |
| `kitchen` | Read-only access to Orders only. Can update order status (cannot cancel). |

Navigation links not permitted for a role are hidden from the sidebar.

---

## 2. Authentication — `/admin/login`

### 2.1 Page Layout

Centered card on a dark or neutral background. Ayola Foods logo above the card.

### 2.2 Form Fields

| Field | Type | Validation |
|---|---|---|
| Email | `input[type=email]` | Required, valid email format |
| Password | `input[type=password]` | Required, min 8 characters |

### 2.3 States

- **Default** — empty form
- **Loading** — submit button shows spinner, inputs disabled
- **Error** — inline error message below form: "Invalid email or password." Do not reveal which field is wrong.
- **Success** — redirect to `/admin`

### 2.4 Elements

- "Sign In" primary button (full width)
- No "Forgot password" link in v1 (out of scope)
- No "Sign up" link — admin accounts are created manually via Supabase

---

## 3. Dashboard — `/admin`

### 3.1 Stat Cards (row of 4)

| Card | Value | Sub-label |
|---|---|---|
| Total Orders | Count of all orders | "All time" |
| Revenue | Sum of `total` for `payment_status = completed` orders, in KES | "Collected" |
| Pending Orders | Count of orders with `status IN (pending, confirmed)` | "Needs action" |
| Customers | Count of distinct customers (profiles with role = customer) | "Registered" |

### 3.2 Recent Orders Table

Last 10 orders by `created_at DESC`. Columns: Order #, Customer, Total, Status badge, Payment badge, Date. Each row is clickable → navigates to `/admin/orders/[id]`.

### 3.3 Revenue Chart

A simple bar chart showing daily revenue for the last 14 days. X-axis: date. Y-axis: KES. Built with the HTML `<canvas>` element or a lightweight SVG approach — do not add a charting library.

### 3.4 Order Status Breakdown

A horizontal bar or simple list showing counts per status: Pending, Confirmed, Preparing, Ready, Dispatched, Delivered, Cancelled.

---

## 4. Orders Module

### 4.1 Orders List — `/admin/orders`

#### Filters Bar (above table)

| Filter | Control | Options |
|---|---|---|
| Status | Select | All, Pending, Confirmed, Preparing, Ready, Dispatched, Delivered, Cancelled |
| Payment | Select | All, Pending, Completed, Failed, Refunded |
| Delivery type | Select | All, Delivery, Pickup, Shipping |
| Date range | Two date inputs | From / To |
| Search | Text input | Matches order number or customer name or phone |

Filters are applied client-side via URL search params. Changing any filter updates the URL and refetches.

#### Table Columns

| Column | Notes |
|---|---|
| Order # | Monospace font. Clickable → order detail |
| Customer | Name + phone on second line |
| Items | Count of distinct line items, e.g. "3 items" |
| Total | KES formatted |
| Delivery type | Badge: Delivery / Pickup / Shipping |
| Status | Colored badge (see status color map below) |
| Payment | Colored badge |
| Date | Relative time (e.g. "2 hours ago") with full datetime on hover |

#### Status Color Map

| Status | Badge color |
|---|---|
| pending | Yellow |
| confirmed | Blue |
| preparing | Orange |
| ready | Purple |
| dispatched | Indigo |
| delivered | Green |
| cancelled | Red |

#### Pagination

Server-side. 20 rows per page. Pagination controls at the bottom: Previous / page numbers / Next.

#### Bulk Actions

Checkbox column on the left. When ≥1 row selected, a floating action bar appears at the bottom of the page with: "Mark as Confirmed", "Mark as Cancelled". Confirm before bulk cancel.

### 4.2 Order Detail — `/admin/orders/[id]`

Two-column layout on desktop, single column on mobile.

#### Left Column — Order Summary

- **Header:** Order number in large type, created date, time elapsed since order
- **Status timeline:** Horizontal stepper showing: Pending → Confirmed → Preparing → Ready → Dispatched → Delivered. Current status highlighted. Cancelled shown as a terminal red state.
- **Status update control:** Dropdown listing valid next statuses only (forward-only, except admin can cancel from any non-terminal state). "Update Status" button. Confirmation dialog before setting Cancelled.
- **Order items table:** Columns: Product name, Unit price, Qty, Line total. Footer row: Subtotal, Delivery fee, **Total**.
- **Order notes:** Displayed if `order_notes` is not null.

#### Right Column — Customer & Payment

**Customer card:**
- Name, phone, email (if present)
- Delivery address + city
- Link to customer profile: "View customer →"

**Payment card:**
- Payment method: M-Pesa / Cash on Delivery
- Payment status badge
- M-Pesa receipt number (if present)
- Checkout request ID (collapsed under "Technical details" disclosure)
- Link to full payment log: "View payment log →"

**Danger zone:**
- "Cancel Order" button (red, outlined). Only shown if order is not already delivered/cancelled. Requires confirmation dialog with reason input (optional free text).

### 4.3 Order Status Update

Inline on the detail page — no separate page needed.

---

## 5. Products Module

### 5.1 Products List — `/admin/products`

#### Toolbar

- Search input (by name or slug)
- Filter by category (select)
- Filter by stock status: All / In stock / Out of stock
- "Add Product" button (primary, top right)

#### Table Columns

| Column | Notes |
|---|---|
| Image | 40×40px thumbnail |
| Name | Bold. Slug on second line in muted text |
| Category | Category name |
| Price | KES formatted |
| Size | Text |
| In stock | Toggle switch — inline update on toggle |
| Active | Toggle switch — inline update on toggle |
| Actions | Edit (pencil icon), Delete (trash icon) |

Clicking a row name navigates to the edit form. Delete requires a confirmation dialog.

### 5.2 Add / Edit Product — `/admin/products/new` and `/admin/products/[id]/edit`

Single-column form, max-width 640px, centered.

#### Fields

| Field | Type | Notes |
|---|---|---|
| Name | Text input | Required |
| Slug | Text input | Required. Auto-populated from name on create (editable). Validated unique on blur. |
| Category | Select | Populated from categories list. Required. |
| Description | Textarea | Short description |
| Long description | Textarea | Full product page description |
| Price (KES) | Number input | Required. Integer. Stored in cents (×100 internally) — display in full KES. |
| Size | Text input | e.g. "500g", "1kg" |
| Image URL | Text input | Direct URL. Show preview below field. |
| Features | Tag/list input | Add/remove text tags |
| Ingredients | Textarea | |
| Nutrition highlights | Tag/list input | Add/remove text tags |
| Badge | Text input | e.g. "New", "Best Seller" |
| In stock | Toggle | Default on |
| Active (visible on site) | Toggle | Default on |
| Sort order | Number input | Integer |

**Save** button (primary). **Cancel** link back to products list. On edit page, "Delete Product" button at the bottom (danger, outlined, requires confirmation).

**Unsaved changes warning** — if the user tries to navigate away with unsaved changes, show a browser confirm dialog.

### 5.3 Categories — `/admin/categories`

#### List

Table with columns: Icon, Name, Slug, Tagline, Ships countrywide (badge), Product count, Sort order, Actions (edit/delete).

#### Add / Edit — `/admin/categories/new` and `/admin/categories/[id]/edit`

Fields: Name, Slug, Tagline, Icon (text/emoji), Description, Color (hex input + preview), Background color (hex input + preview), Ships countrywide (toggle), Price from (number), Sort order (number).

---

## 6. Customers Module

### 6.1 Customers List — `/admin/customers`

#### Toolbar

- Search: matches name, email, or phone
- Filter by role: All / Customer / Kitchen / Admin

#### Table Columns

| Column | Notes |
|---|---|
| Name | Full name |
| Email | |
| Phone | |
| Role | Badge |
| Default city | |
| Joined | Relative date |
| Orders | Count of orders placed |
| Actions | View profile |

### 6.2 Customer Profile — `/admin/customers/[id]`

#### Profile Card

Name, email, phone, role, default address, city, joined date.

**Role change control:** Dropdown (customer / kitchen / admin) + "Update Role" button. Confirmation dialog when promoting to admin.

#### Order History Table

All orders by this customer. Columns: Order #, Date, Total, Status, Payment status. Each row links to `/admin/orders/[id]`.

**Summary stat row above table:** Total orders, Total spent (KES).

---

## 7. Payments Module

### 7.1 Payments List — `/admin/payments`

This view is read-only. No payment mutations from the admin panel in v1 (refunds are out of scope).

#### Toolbar

- Search: by order number or M-Pesa receipt
- Filter by payment method: All / M-Pesa / Cash on Delivery
- Filter by status: All / Pending / Processing / Completed / Failed / Refunded
- Date range filter

#### Table Columns

| Column | Notes |
|---|---|
| Order # | Links to order detail |
| Customer | Name + phone |
| Amount | KES |
| Method | M-Pesa / Cash on Delivery |
| Status | Colored badge |
| Receipt # | M-Pesa receipt number (if present) |
| Date | |

### 7.2 Payment Log Detail — `/admin/payments/[orderId]`

Shows all `payment_logs` rows for an order, newest first.

Table columns: Timestamp, Provider, Event type, Raw payload (expandable JSON block).

Back link to the order detail.

---

## 8. Notifications Module

### 8.1 Notification Bell (Topbar)

Bell icon shows an unread badge count. Clicking opens a dropdown panel listing the 10 most recent notifications with title, short message, relative time, and read/unread dot. "Mark all as read" button at top of panel. "View all →" link to the full notifications page.

### 8.2 Notifications List — `/admin/notifications`

A feed of all notifications, newest first.

Each notification card shows: icon (by type), title, message, relative timestamp, read indicator. Clicking marks it as read and (if linked to an order) navigates to that order.

#### Notification Types

| Type | Trigger |
|---|---|
| `new_order` | A new order is placed |
| `payment_completed` | M-Pesa payment confirmed |
| `payment_failed` | M-Pesa payment failed |
| `order_cancelled` | Order is cancelled (by customer or admin) |

#### Mark Read Actions

- Click notification → mark as read
- "Mark all as read" button at top
- Individual "dismiss" (×) on each card

**Note:** In v1, notifications are stored in the database and polled every 30 seconds on the admin side. Real-time via Supabase Realtime is the v2 upgrade path.

---

## 9. Settings — `/admin/settings`

Tabbed layout. Three tabs:

### 9.1 Store tab

| Field | Notes |
|---|---|
| Store name | Text. Default "Ayola Foods KE" |
| Support email | Text |
| Support phone | Text |
| Default delivery fee (KES) | Number |
| Delivery cities | Tag list of city names |
| Order notification email recipients | Tag list of email addresses |

### 9.2 M-Pesa tab

Displays current M-Pesa environment (sandbox / production) and whether credentials are configured. Does **not** display actual keys. A "Test connection" button hits the API to verify credentials.

| Field | Notes |
|---|---|
| Environment | Read-only badge: Sandbox / Production |
| Consumer Key | Masked input (shows last 4 chars). Save to update. |
| Consumer Secret | Masked input. Save to update. |
| Shortcode | Editable |
| Passkey | Masked input |
| Callback URL | Editable |

**Warning banner** if `MPESA_ENVIRONMENT=production` to prevent accidental changes.

### 9.3 Admin Accounts tab

Table of all users with role `admin` or `kitchen`. Columns: Name, Email, Role, Joined. "Invite admin" button — opens a modal with email input. Sends a Supabase invite email. Remove button per row (cannot remove your own account).

---

## 10. UI Patterns and Standards

### 10.1 Empty States

Every list/table shows an empty state illustration + message when there are no results. Example: "No orders yet" with a sub-message appropriate to context.

### 10.2 Loading States

Tables show a skeleton loader (3–5 ghost rows) while data is fetching. Stat cards show a pulsing placeholder rectangle.

### 10.3 Error States

If a page-level data fetch fails, show an inline error card: icon + "Failed to load [resource]. Try again." with a Retry button.

### 10.4 Confirmation Dialogs

All destructive or irreversible actions (delete, cancel, role change to admin) require a shadcn/ui `AlertDialog` with a descriptive message and explicit Confirm / Cancel buttons. The Confirm button is red.

### 10.5 Toast Notifications

All mutations (create, update, delete) show a shadcn/ui `Toast` on success or failure. Success toasts auto-dismiss after 3 seconds. Error toasts stay until dismissed.

### 10.6 Form Validation

- Client-side validation on submit using Zod
- Field-level error messages shown inline below the field
- Required fields marked with `*`
- Submit button disabled while loading

### 10.7 Responsive Behavior

| Breakpoint | Sidebar behavior |
|---|---|
| ≥1024px (desktop) | Sidebar always visible |
| <1024px (tablet/mobile) | Sidebar hidden, accessible via hamburger button in topbar |

Tables on mobile become horizontally scrollable with a scroll indicator.

### 10.8 Date & Currency Formatting

- All dates: `DD MMM YYYY, HH:mm` (e.g. "02 Apr 2026, 14:35")
- Relative times: "2 hours ago", "Yesterday", etc.
- Currency: `KES 1,250.00` — always with currency code prefix

---

## 11. Route Map

```
/admin/login                         ← Authentication
/admin                               ← Dashboard
/admin/orders                        ← Orders list
/admin/orders/[id]                   ← Order detail + status update
/admin/products                      ← Products list
/admin/products/new                  ← Add product form
/admin/products/[id]/edit            ← Edit product form
/admin/categories                    ← Categories list
/admin/categories/new                ← Add category form
/admin/categories/[id]/edit          ← Edit category form
/admin/customers                     ← Customers list
/admin/customers/[id]                ← Customer profile + order history
/admin/payments                      ← Payments list
/admin/payments/[orderId]            ← Payment log detail
/admin/notifications                 ← Notifications feed
/admin/settings                      ← Settings (tabbed)
```
