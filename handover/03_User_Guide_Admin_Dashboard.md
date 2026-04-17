# 03 — User Guide: Admin Dashboard

**Audience:** Admin Staff (Prisca and team), Kitchen Staff  
**URL:** https://ayola-foods-ke.vercel.app/admin  
**Access:** Requires an admin or kitchen account created in Supabase Auth

---

## 1. Getting Started

### 1.1 Logging In

1. Visit `/admin/login`
2. Enter your **email** and **password** (minimum 8 characters)
3. Click **Sign In**
4. If credentials are correct, you'll be taken to the **Dashboard**

> ⚠️ There is no "Forgot Password" link in the current version. If you lose your password, ask the developer to reset it via the Supabase dashboard.

> **Account creation:** Admin accounts are NOT created through the website. They are either invited from **Settings → Admin Accounts** or created directly in Supabase by the developer.

### 1.2 Logging Out

Click your **name/avatar** in the sidebar bottom section, then click **Sign Out**.

---

## 2. Understanding User Roles

There are two roles in the admin panel:

| Role | What they can do |
|---|---|
| **Admin** | Full access — manage orders, products, categories, customers, payments, notifications, and settings |
| **Kitchen** | Read-only access to Orders only. Can update order statuses (but cannot cancel orders) |

Kitchen staff will only see the **Orders** section in the sidebar. All other menu items are hidden.

---

## 3. The Admin Layout

The admin panel has three regions:

| Region | Description |
|---|---|
| **Sidebar (left)** | Navigation links. Collapses to icons on smaller screens. |
| **Topbar (top)** | Shows current page title, notification bell, and your name |
| **Content area (right)** | The main working area for each module |

**Sidebar navigation links:**
1. Dashboard
2. Orders *(with unread badge for new orders)*
3. Products
4. Categories
5. Customers
6. Payments
7. Notifications *(with unread badge)*
8. Settings

---

## 4. Dashboard (`/admin`)

The dashboard is your homepage at a glance.

### 4.1 Stat Cards

Four cards at the top showing:
| Card | What it shows |
|---|---|
| **Total Orders** | All time order count |
| **Revenue (KES)** | Total collected from M-Pesa payments |
| **Pending Orders** | Orders needing your action (status: Pending or Confirmed) |
| **Customers** | Total registered customer accounts |

### 4.2 Recent Orders Table

The 10 most recent orders, showing: Order #, Customer, Total, Status, Payment badge, Date. Click any row to open the full order detail.

### 4.3 Revenue Chart

A bar chart showing **daily revenue for the last 14 days**. This only counts orders where M-Pesa payment is completed.

### 4.4 Order Status Breakdown

A summary list showing how many orders are currently in each status (Pending, Confirmed, Preparing, etc.).

---

## 5. Orders Module

### 5.1 Orders List (`/admin/orders`)

This is where you manage all customer orders.

**Filtering your orders:**
| Filter | Options |
|---|---|
| Status | All / Pending / Confirmed / Preparing / Ready / Dispatched / Delivered / Cancelled |
| Payment | All / Pending / Completed / Failed / Refunded |
| Delivery Type | All / Delivery / Pickup / Shipping |
| Date Range | From / To |
| Search | Order number, customer name, or phone |

**Order status colours:**
| Status | Badge colour |
|---|---|
| Pending | 🟡 Yellow |
| Confirmed | 🔵 Blue |
| Preparing | 🟠 Orange |
| Ready | 🟣 Purple |
| Dispatched | 🔷 Indigo |
| Delivered | 🟢 Green |
| Cancelled | 🔴 Red |

**Pagination:** 20 orders per page. Use the Previous / Next controls at the bottom.

**Bulk Actions (Admin only):**
1. Tick the checkboxes on the left of multiple order rows
2. A floating action bar appears at the bottom
3. Choose **Mark as Confirmed** or **Mark as Cancelled**
4. Confirm any cancellation in the dialogue that appears

### 5.2 Order Detail (`/admin/orders/[id]`)

Click any order to open the detail view.

**Left column — Order Summary:**
- Order number, date, time since order
- **Status Timeline** — horizontal stepper showing current progress
- **Update Status** — dropdown showing valid next steps only; click "Update Status" to advance
- **Order items table** — product name, unit price, quantity, line total, subtotal, delivery fee, **total**
- Order notes (if any)

**Right column — Customer & Payment:**
- Customer name, phone, email, delivery address
- Link to their full profile → "View customer →"
- Payment method (M-Pesa / Cash on Delivery)
- Payment status badge
- M-Pesa receipt number (if paid)
- "View payment log →" for full payment history

**Cancelling an order (Admin only):**
- Red **"Cancel Order"** button appears if the order is not yet Delivered or already Cancelled
- A confirmation prompt asks for an optional cancellation reason
- Once confirmed, the order moves to **Cancelled** and cannot be changed further

### 5.3 Status Flow Rules

Orders move **forward only** through the pipeline:

```
Pending → Confirmed → Preparing → Ready → Dispatched → Delivered
```

- You **cannot move an order backwards** (e.g., from Preparing back to Pending)
- **Cancelled** is special — it can be set from any stage before Delivered
- **Kitchen role** can advance statuses but **cannot cancel**

---

## 6. Products Module

### 6.1 Products List (`/admin/products`)

Shows all products including inactive ones. Use the toolbar to:
- Search by name or slug
- Filter by category
- Filter by stock status (All / In stock / Out of stock)
- Click **"Add Product"** to create a new product

**Quick toggles (inline, no page reload):**
- **In Stock** toggle — instantly marks a product as in/out of stock on the website
- **Active** toggle — hides or shows the product on the customer-facing website

### 6.2 Adding a New Product (`/admin/products/new`)

Fill in the form:

| Field | Notes |
|---|---|
| **Name** *(required)* | Product display name |
| **Slug** *(required)* | URL-safe identifier, auto-generated from name. Must be unique. |
| **Category** *(required)* | Select from existing categories |
| **Description** | Short description (used in product cards) |
| **Long Description** | Full product page description |
| **Price (KES)** *(required)* | Whole number in KES (e.g., 250) |
| **Size** | e.g., "500g", "1L", "2kg" |
| **Image URL** | Direct URL to a product image. A preview appears below the field. |
| **Features** | Add clickable tags (e.g., "Gut Health", "High Protein") |
| **Ingredients** | List of ingredients |
| **Nutrition Highlights** | Add tags (e.g., "Rich in Iron", "Probiotic") |
| **Badge** | Small label on the product card (e.g., "New", "Best Seller") |
| **In Stock** | Toggle — ON by default |
| **Active (visible on site)** | Toggle — ON by default |
| **Sort Order** | Integer — lower numbers appear first |

Click **Save** to create. Click **Cancel** to go back without saving.

> **Unsaved changes warning:** If you try to leave the form with unsaved changes, the browser will ask you to confirm.

### 6.3 Editing a Product (`/admin/products/[id]/edit`)

Same form as adding. The **Delete Product** button appears at the bottom.

> **Note on deletion:** If a product has been ordered by any customer, it cannot be hard-deleted. Instead it is automatically **deactivated** (hidden from the website) to preserve order history. You will see a message explaining this.

---

## 7. Categories Module (`/admin/categories`)

Categories group your products (e.g., Meals, Beverages, Packaged, Flour Blends).

**Category list columns:** Icon, Name, Slug, Tagline, Ships Countrywide, Product Count, Sort Order, Actions.

**Add / Edit category fields:**

| Field | Notes |
|---|---|
| **Name** | Display name of the category |
| **Slug** | URL-safe identifier (e.g., `beverages`) |
| **Tagline** | Short line shown under the category name |
| **Icon** | Text or emoji (e.g., 🫙, 🥤) |
| **Description** | Longer description |
| **Color** | Hex colour for the category card gradient |
| **Background Color** | Hex colour for the card background |
| **Ships Countrywide** | Toggle — if ON, a "Ships countrywide" badge appears on products |
| **Price From (KES)** | Starting price shown on the category card |
| **Sort Order** | Integer — lower numbers appear first |

> **Cannot delete a category that has products.** You must reassign or delete all products in that category first.

---

## 8. Customers Module

### 8.1 Customers List (`/admin/customers`)

Search by name, email, or phone. Filter by role (All / Customer / Kitchen / Admin).

**Table columns:** Name, Email, Phone, Role badge, Default City, Joined date, Orders count, View Profile action.

### 8.2 Customer Profile (`/admin/customers/[id]`)

Shows all information about a customer:
- Full profile details (name, email, phone, address, role, join date)
- **Role Change** *(Admin only)* — change the customer's role. Promoting someone to Admin requires confirmation.
- **Order History** — all orders this customer has placed, with Order #, Date, Total, Status, and Payment status. Each row links to the order detail.
- **Summary stats** above the table: Total Orders and Total Spent (KES)

---

## 9. Payments Module

### 9.1 Payments List (`/admin/payments`)

A **read-only** view of all payment records. No mutations here (refunds are handled manually).

Search by order number or M-Pesa receipt. Filter by method (M-Pesa / Cash on Delivery) and status. Date range filter available.

**Table columns:** Order #, Customer, Amount (KES), Method, Status badge, M-Pesa Receipt #, Date.

### 9.2 Payment Log Detail (`/admin/payments/[orderId]`)

Shows the full technical log of all payment events for a specific order — including STK push initiation, Safaricom callbacks, and any errors.

Each row shows: Timestamp, Provider (mpesa), Event type, Raw payload (expandable JSON).

Use this page to investigate payment failures or disputes.

---

## 10. Notifications Module

### 10.1 Notification Bell (Topbar)

A bell icon in the topbar shows a **badge number** for unread notifications. Clicking the bell opens a dropdown with:
- Last 10 notifications (title, short message, time, read/unread dot)
- **"Mark all as read"** button
- **"View all →"** link to the full notifications page

### 10.2 Notifications Page (`/admin/notifications`)

Full feed of all notifications, newest first.

**Notification types:**
| Type | When it appears |
|---|---|
| 🛒 **New Order** | Every time a customer places an order |
| ✅ **Payment Received** | When M-Pesa payment is successfully confirmed |
| ❌ **Payment Failed** | When M-Pesa payment fails |
| 🚫 **Order Cancelled** | When an order is cancelled (by customer or admin) |

**Actions:**
- **Click** a notification → marks it as read. If linked to an order, navigates to that order.
- **× (dismiss)** on each card → marks that notification as read/dismissed
- **"Mark all as read"** button at the top → clears all notification badges

> **Note:** Notifications are checked automatically every **30 seconds**. You do not need to refresh the page.

---

## 11. Settings (`/admin/settings`)

The Settings page has **three tabs:**

### Tab 1 — Store

| Field | Description |
|---|---|
| Store Name | Default: "Ayola Foods KE" |
| Support Email | Email shown to customers |
| Support Phone | Phone shown to customers |
| Default Delivery Fee (KES) | Applied to orders unless overridden |
| Delivery Cities | Tag list — cities where delivery is offered |
| Order Notification Email Recipients | Email addresses to CC on new orders |

Click **Save** to apply changes.

### Tab 2 — M-Pesa

> ⚠️ **Production Warning:** If M-Pesa is set to `production` mode, a red warning banner is shown. Be very careful making any changes here.

| Field | Description |
|---|---|
| Environment | Read-only badge: **Sandbox** or **Production** |
| Consumer Key | Masked. Shows last 4 characters. Update to change. |
| Consumer Secret | Masked. Update to change. |
| Shortcode | Your Safaricom paybill/till number |
| Passkey | Masked. Used to sign STK push requests. |
| Callback URL | The URL Safaricom sends payment results to (must be publicly accessible) |

**Test Connection button** — clicks the API to verify that your M-Pesa credentials are valid without making a real payment.

### Tab 3 — Admin Accounts

Table of all admin and kitchen users with: Name, Email, Role, Joined date.

**Invite Admin:**
1. Click **"Invite Admin"**
2. Enter the new user's email address
3. Select role: Kitchen or Admin
4. Click **Send Invite**
5. The user receives an invitation email from Supabase to set their password

**Remove Access:**
- Click the **Remove** button next to any admin/kitchen user
- This **does not delete** their account — it downgrades their role to `customer`
- You cannot remove your own account

---

## 12. Common Admin Tasks (Quick Reference)

### ✅ Process a New Order
1. See the 🔔 badge on the Orders icon or notification bell
2. Go to **Orders**
3. Find the order (status: Pending)
4. Click the order
5. Update status to **Confirmed**
6. As you prepare: update to **Preparing**, then **Ready**
7. When dispatched: **Dispatched**
8. When delivered: **Delivered**

### ✅ Add a New Product
1. Go to **Products**
2. Click **"Add Product"**
3. Fill in all required fields (marked with *)
4. Upload an image URL
5. Click **Save**

### ✅ Mark a Product Out of Stock
1. Go to **Products**
2. Find the product in the table
3. Toggle the **In Stock** switch to OFF

### ✅ Invite a New Kitchen Staff Member
1. Go to **Settings → Admin Accounts tab**
2. Click **"Invite Admin"**
3. Enter their email, select role **Kitchen**
4. Click **Send Invite**
5. They receive an email to set their password

### ✅ Investigate a Payment Problem
1. Go to **Payments**
2. Search by order number or M-Pesa receipt
3. Click the Order # to go to the order
4. Then click **"View payment log →"** to see the raw Safaricom event log

### ✅ Change a User's Role
1. Go to **Customers**
2. Search for the user
3. Click **View Profile**
4. Use the **Role** dropdown → click **Update Role**

---

## 13. Tips & Best Practices

- **Check notifications** at least once an hour during business hours
- **Confirm orders quickly** — customers see "Pending" until you confirm
- Never share your admin login — each staff member should have their own account
- If M-Pesa callbacks seem delayed, use the **Payment Log** to check the raw status
- The **Revenue chart** on the dashboard only counts M-Pesa completed payments — Cash on Delivery orders appear in order totals but not in revenue until manually reconciled
