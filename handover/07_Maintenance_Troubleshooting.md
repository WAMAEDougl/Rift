# 07 — Maintenance & Troubleshooting

**Audience:** Developers and Admin Staff  
**Purpose:** Common issues, how to diagnose them, and how to fix them

---

## 1. Routine Maintenance Tasks

### 1.1 Adding a New Product (Non-Technical — Admin UI)
See **Admin Dashboard User Guide → Section 6.2**

### 1.2 Updating Prices (Non-Technical)
1. Go to **Admin → Products**
2. Click on the product name to open the edit form
3. Update the **Price (KES)** field
4. Click **Save**

> Price changes take effect immediately. They do not affect past orders (order_items store a price snapshot).

### 1.3 Taking a Product Offline
Toggle the **Active** switch OFF in the products list (no form needed). The product disappears from the public website immediately.

### 1.4 Marking Out of Stock
Toggle the **In Stock** switch OFF. The product remains visible on the website but shows "Out of Stock" and cannot be added to cart.

### 1.5 Updating Store Settings
Go to **Admin → Settings → Store tab** and update any of: store name, support contacts, delivery fee, or delivery cities.

### 1.6 Database Backups
Supabase automatically creates **daily backups** on paid plans. On the free tier:
- Backups are limited — consider exporting data manually periodically
- Go to Supabase Dashboard → Settings → Database → Backups

### 1.7 Monitoring Notification Emails
If you've set **Order Notification Email Recipients** in Settings, new order emails go there. Verify deliverability with your email provider.

---

## 2. Common Issues & Fixes

### 🔴 Issue: Admin cannot log in

**Symptoms:** Login page shows "Invalid email or password" or redirects back to login.

**Checklist:**
1. Verify the email and password are correct
2. Check that the user's profile has `role = 'admin'` or `role = 'kitchen'`:
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'admin@example.com';
   ```
3. If role is `'customer'`, update it:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
   ```
4. If the user doesn't exist in `profiles`, check Supabase Auth → Users to confirm the account
5. Check Supabase → Logs → Auth for authentication errors

---

### 🔴 Issue: M-Pesa STK Push not arriving on customer's phone

**Symptoms:** Customer clicks "Pay with M-Pesa" but receives no prompt.

**Checklist:**
1. Verify the phone number is correct and in the format `07XXXXXXXX` or `+2547XXXXXXXX`
2. Check the payment log in the admin panel (`Admin → Payments → [Order] → View payment log`) for the raw Safaricom response
3. Check that `MPESA_ENVIRONMENT` matches your credentials (sandbox credentials won't work in production mode and vice versa)
4. Use **Settings → M-Pesa → Test Connection** to verify credentials
5. Common Safaricom error codes:
   | Code | Meaning |
   |---|---|
   | 0 | Success |
   | 1 | Insufficient funds |
   | 1032 | Request cancelled by user |
   | 1037 | DS timeout user cannot be reached |
   | 17 | M-Pesa temporary error — retry |

---

### 🔴 Issue: M-Pesa payment shows "completed" but order still shows "pending payment"

**Symptoms:** Customer paid successfully but the order's `payment_status` is still `pending` or `processing`.

**Cause:** The Safaricom callback URL may not be reachable, or the callback was not processed correctly.

**Fix:**
1. Go to **Admin → Payments → [Order] → View payment log**
2. Check if a `stk_callback` event exists with `ResultCode: 0`
3. If the callback was received but not processed, check Vercel function logs for errors at `/api/payments/mpesa/callback`
4. If no callback event at all, the callback URL is likely blocked:
   - Ensure `MPESA_CALLBACK_URL` is publicly accessible via HTTPS
   - Ensure there are no firewall rules blocking Safaricom IPs
5. **Manual fix** — update the order directly in Supabase:
   ```sql
   UPDATE orders
   SET payment_status = 'completed',
       mpesa_receipt_number = 'QHF2XXXXX'
   WHERE order_number = 'AYF-001234';
   ```

---

### 🔴 Issue: Product images not showing

**Symptoms:** Product cards show broken image icons or placeholder boxes.

**Fix:**
1. Go to **Admin → Products → [Product] → Edit**
2. Check the **Image URL** field — the URL must be a publicly accessible direct image link (ending in `.jpg`, `.png`, `.webp`, etc.)
3. Ensure the URL does not require authentication to access
4. Test the URL in a new browser tab to confirm it loads
5. If using Supabase Storage, ensure the bucket is set to **Public**

---

### 🔴 Issue: Orders not appearing in admin panel

**Symptoms:** A customer says they placed an order but it's not visible in the admin.

**Fix:**
1. Check Supabase directly:
   ```sql
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
   ```
2. If the order exists in the DB but not in the admin UI, check for filter settings on the orders list (status filter may be hiding it)
3. If the order doesn't exist in the DB, the order creation API call may have failed:
   - Check Vercel function logs for errors at `/api/orders`
   - Ask the customer for the approximate time and check logs

---

### 🔴 Issue: Notifications not appearing

**Symptoms:** New orders come in but the notification bell doesn't light up.

**Checklist:**
1. The admin panel polls for notifications every **30 seconds** — wait up to 30 seconds after a new order
2. Verify the `notifications` table exists and has rows:
   ```sql
   SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
   ```
3. If the table is empty, check that the notification creation (`createNotification()`) helper is being called in the orders API route
4. Check that the `notifications` table was created: run `supabase/step2_notifications.sql`

---

### 🔴 Issue: "Internal server error" on any admin page

**Symptoms:** A page shows a generic error instead of data.

**Checklist:**
1. Check **Vercel → Deployments → Functions → Logs** for the exact error message
2. Common causes:
   - Environment variable missing or wrong (check `.env` / Vercel env vars)
   - Supabase project paused (free tier projects pause after inactivity) — go to Supabase dashboard to unpause
   - Database table missing — run the missing migration file
3. Check Supabase status at [status.supabase.com](https://status.supabase.com)

---

### 🔴 Issue: Supabase project is paused

**Symptoms:** All API calls fail, pages show errors or are empty.

**Cause:** Supabase free tier projects pause after 1 week of inactivity.

**Fix:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Find the project
3. Click **Restore Project** (takes 1–2 minutes)

> **Prevention:** Upgrade to Supabase Pro plan (paid) which does not auto-pause, or set up a simple cron job to ping the database periodically.

---

### 🔴 Issue: Cannot delete a category

**Symptoms:** A confirmation error appears: "Category has products. Reassign or delete them first."

**Fix:**
1. Go to **Admin → Products**
2. Filter by the category you want to delete
3. Either:
   - **Reassign** each product to a different category (edit each product)
   - **Delete** the products (if no order history) or **deactivate** them
4. Once the category has 0 products, delete it

---

### 🔴 Issue: Cannot delete a product

**Symptoms:** Product shows "soft deleted" message — was deactivated instead of deleted.

**Explanation:** This is expected behaviour. Products that have been ordered cannot be hard-deleted because deleting them would break the order history display. They are instead deactivated (hidden from the public website).

**To fully remove from order history visibility:**
- This is a business decision — the product name is stored as a snapshot in `order_items.product_name`, so the order history still reads correctly even if the product is deleted from the products table.

---

## 3. Security Checklist

Verify these periodically:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is not exposed in any client-side code or Git commits
- [ ] Admin user accounts use strong, unique passwords
- [ ] Remove admin/kitchen access for any staff who have left (`Settings → Admin Accounts → Remove`)
- [ ] M-Pesa credentials are stored only in environment variables, never in code
- [ ] Supabase RLS policies are active (check via `SELECT * FROM pg_policies` in SQL editor)
- [ ] Review Supabase Auth → Users periodically for unexpected accounts

---

## 4. Adding a New Developer

When handing over to a new developer, they need:

1. **Vercel access** — invite them at vercel.com → Team → Members
2. **Supabase access** — invite them at Supabase Dashboard → Settings → Team
3. **GitHub repository access** — invite them on GitHub
4. **Environment variables** — share the `.env` file securely (never via email or Slack in plain text — use a password manager)
5. **This documentation** — point them to the `/handover` folder

---

## 5. Useful Admin SQL Queries

Access these in **Supabase → SQL Editor**:

**View all recent orders with customer details:**
```sql
SELECT
  o.order_number,
  o.customer_name,
  o.customer_phone,
  o.status,
  o.payment_status,
  o.total,
  o.created_at
FROM orders o
ORDER BY created_at DESC
LIMIT 20;
```

**Find a specific order:**
```sql
SELECT * FROM orders WHERE order_number = 'AYF-001234';
```

**View all line items in an order:**
```sql
SELECT
  oi.product_name,
  oi.product_price,
  oi.quantity,
  oi.line_total
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.order_number = 'AYF-001234';
```

**Monthly revenue summary:**
```sql
SELECT
  date_trunc('month', created_at) AS month,
  COUNT(*) AS order_count,
  SUM(total) AS revenue_kes
FROM orders
WHERE payment_status = 'completed'
GROUP BY month
ORDER BY month DESC;
```

**Count orders by status:**
```sql
SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY COUNT(*) DESC;
```

**List all admin/kitchen users:**
```sql
SELECT id, full_name, email, role, created_at
FROM profiles
WHERE role IN ('admin', 'kitchen')
ORDER BY created_at;
```

**Manually mark a payment as completed (use only if callback failed):**
```sql
-- Replace values with actual order details
UPDATE orders
SET
  payment_status = 'completed',
  mpesa_receipt_number = 'QHF2XXXXX'
WHERE order_number = 'AYF-001234'
  AND payment_status IN ('pending', 'processing');
```

---

## 6. Contact for Technical Support

If you encounter an issue not covered here:

1. Check **Vercel function logs** for error details
2. Check **Supabase logs** (Dashboard → Logs)
3. Search the [Next.js documentation](https://nextjs.org/docs) and [Supabase documentation](https://supabase.com/docs)
4. Reach out to the development team with:
   - The exact error message (from the logs)
   - The URL / admin page where the error occurred
   - The time the error happened
   - What action triggered the error
