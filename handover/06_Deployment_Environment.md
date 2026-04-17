# 06 — Deployment & Environment

**Audience:** Developers / DevOps  
**Hosting:** Vercel (primary) + Docker (optional self-hosted)  
**Database:** Supabase (hosted)

---

## 1. Architecture Overview

```
Browser / Customer
        │
        ▼
   Vercel (CDN + Edge)
   ┌─────────────────────────────────┐
   │  Next.js 16 App                 │
   │  - Public pages (SSR/SSG)       │
   │  - Admin dashboard (SSR)        │
   │  - API Route Handlers           │
   └───────┬─────────────┬───────────┘
           │             │
           ▼             ▼
      Supabase       Safaricom
      (PostgreSQL    Daraja API
      + Auth         (M-Pesa STK
      + Storage)      Push)
```

---

## 2. Environment Variables

All environment variables are stored in the `.env` file locally. On Vercel, they are set in the project's **Environment Variables** section (Dashboard → Project → Settings → Environment Variables).

**Full list of required variables:**

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose) | Supabase → Settings → API |
| `MPESA_CONSUMER_KEY` | Safaricom Daraja consumer key | Safaricom Developer Portal |
| `MPESA_CONSUMER_SECRET` | Safaricom Daraja consumer secret | Safaricom Developer Portal |
| `MPESA_SHORTCODE` | Paybill or till number | Safaricom |
| `MPESA_PASSKEY` | STK Push passkey | Safaricom |
| `MPESA_CALLBACK_URL` | Public URL for Safaricom to send payment results | Your deployed domain |
| `MPESA_ENVIRONMENT` | `sandbox` or `production` | Set manually |

> ⚠️ **`SUPABASE_SERVICE_ROLE_KEY`** must NEVER be exposed to the browser. It bypasses all Row Level Security. It is only used in server-side Route Handlers.

> ⚠️ **`NEXT_PUBLIC_*`** variables ARE visible in the browser. Do not put secrets in these.

### `.env.example` (template)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=
MPESA_ENVIRONMENT=sandbox
```

---

## 3. Supabase Setup

### 3.1 Creating a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and log in
2. Click **New Project**
3. Choose a name (e.g., `ayola-foods-ke`) and region (Africa — closest available)
4. Set a strong database password (save this securely)
5. Wait for the project to provision

### 3.2 Running Database Migrations

Once the project is ready, open the **SQL Editor** in the Supabase dashboard and run the files in this order:

```
1. website/supabase/step1_tables.sql
2. website/supabase/step2_notifications.sql
3. website/supabase/step2_rls_and_seed.sql
4. website/supabase/step3_settings.sql
5. website/supabase/step3_grant_access.sql
6. website/supabase/seed.sql             ← Optional: seeds initial product data
```

> You can also run `website/supabase/run_this_in_dashboard.sql` which combines all steps into one file.

### 3.3 Creating the First Admin User

Admin accounts cannot be created through the website. Use one of these methods:

**Method A — Supabase Dashboard:**
1. Go to Supabase → Authentication → Users
2. Click **Invite User** and enter the admin email
3. User receives an email to set their password
4. After they accept, run this SQL to set their role:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@ayolafoods.com';
   ```

**Method B — Admin Settings (once first admin exists):**
1. Log into the admin panel as an existing admin
2. Go to **Settings → Admin Accounts**
3. Click **Invite Admin** and enter the email + role

### 3.4 Supabase Auth Settings

Ensure these are configured in Supabase Dashboard → Authentication → Settings:

| Setting | Value |
|---|---|
| **Email confirmation** | Optional (disable for dev, enable for prod) |
| **Site URL** | `https://ayola-foods-ke.vercel.app` |
| **Redirect URLs** | Add your Vercel preview URLs + production URL |

---

## 4. Vercel Deployment

### 4.1 Initial Setup

1. Push the code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Connect to the GitHub repo
4. Set the **Root Directory** to `website/` (the Next.js app is inside the `website` subfolder)
5. Vercel auto-detects Next.js — no build command changes needed
6. Add all environment variables (see section 2)
7. Click **Deploy**

### 4.2 Subsequent Deployments

Every push to the `main` branch triggers an automatic deployment on Vercel. No manual action needed.

**Preview deployments:** Every pull request gets its own preview URL automatically.

### 4.3 Custom Domain Setup

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `ayolafoods.com`)
3. Update your domain's DNS with the CNAME/A records Vercel provides
4. Update `NEXT_PUBLIC_SUPABASE_URL` and all redirect URLs in Supabase to use the new domain
5. Update `MPESA_CALLBACK_URL` to use the new domain

---

## 5. M-Pesa (Daraja API) Setup

### 5.1 Getting Credentials

**Sandbox (for testing):**
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account and log in
3. Go to **My Apps** → Create a new app
4. Enable the **Lipa na M-Pesa Online** (STK Push) API
5. Copy the **Consumer Key** and **Consumer Secret** from the app
6. For sandbox shortcode and passkey, use Safaricom's test credentials (available in the API simulator)

**Production:**
1. Apply for an M-Pesa Business Shortcode (Paybill or Till) through your bank or Safaricom
2. Complete the Daraja Go-Live process on the developer portal
3. Production credentials are issued separately

### 5.2 Switching to Production

1. In Vercel (or `.env`), change `MPESA_ENVIRONMENT=production`
2. Update `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, `MPESA_PASSKEY` with production values
3. Set `MPESA_CALLBACK_URL` to your **publicly accessible** production URL:
   ```
   https://ayolafoods.com/api/payments/mpesa/callback
   ```
4. The callback URL **must be HTTPS** and publicly reachable by Safaricom's servers
5. Test with a real small transaction before going fully live
6. Use **Settings → M-Pesa → Test Connection** in the admin panel to verify credentials

### 5.3 M-Pesa Callback URL

This is the endpoint Safaricom calls after a payment is completed or fails:
```
/api/payments/mpesa/callback
```

- This URL is publicly accessible (no authentication required — Safaricom manages security)
- It handles both success (ResultCode=0) and failure (ResultCode≠0) cases
- On success: updates `payment_status = 'completed'` and saves the receipt number
- On failure: updates `payment_status = 'failed'`
- Creates a `notifications` record and logs to `payment_logs` in both cases

---

## 6. Docker Deployment (Alternative / Self-Hosted)

If you choose to self-host instead of using Vercel:

### 6.1 Build & Run

```bash
# Navigate to the website directory
cd website/

# Build the Docker image
docker build -t ayola-foods-website .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx \
  -e SUPABASE_SERVICE_ROLE_KEY=xxxx \
  -e MPESA_CONSUMER_KEY=xxxx \
  -e MPESA_CONSUMER_SECRET=xxxx \
  -e MPESA_SHORTCODE=xxxx \
  -e MPESA_PASSKEY=xxxx \
  -e MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback \
  -e MPESA_ENVIRONMENT=production \
  ayola-foods-website
```

### 6.2 Using Docker Compose

Create a `.env` file with all variables (see `.env.example`), then:

```bash
cd website/
docker-compose up -d
```

The `docker-compose.yml` is configured with a health check and auto-restart (`unless-stopped`).

### 6.3 Reverse Proxy (Nginx)

If hosting on a VPS, place Nginx in front of the Docker container:

```nginx
server {
    listen 80;
    server_name ayolafoods.com www.ayolafoods.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Use **Certbot** for HTTPS (required for M-Pesa callback).

---

## 7. Local Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd ayolafoods.com/website

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase and M-Pesa credentials in .env

# 4. Start the development server
npm run dev
# App runs at http://localhost:3000
```

**Useful dev commands:**

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Run ESLint |

---

## 8. CI/CD Overview

```
Developer pushes to GitHub
         │
         ▼
   Vercel detects push
         │
         ├── PR branch → Preview deployment URL
         │
         └── main branch → Production deployment
                                │
                                ▼
                     Auto health check
                     (Vercel built-in)
```

No manual deployment steps are needed once the initial Vercel project is configured.

---

## 9. Monitoring & Logs

| Tool | Purpose | Access |
|---|---|---|
| **Vercel Dashboard** | Function logs, deployment history, performance | vercel.com |
| **Supabase Dashboard** | Database queries, auth events, logs | app.supabase.com |
| **Supabase → Logs** | API logs, authentication logs, edge logs | Supabase dashboard → Logs |
| **Admin Panel → Payments** | M-Pesa payment logs | `/admin/payments/[orderId]` |

---

## 10. Production Checklist

Before going live, verify:

- [ ] `MPESA_ENVIRONMENT=production` is set
- [ ] `MPESA_CALLBACK_URL` points to the live HTTPS domain
- [ ] Supabase **Site URL** updated to production domain
- [ ] Supabase **Redirect URLs** include production domain
- [ ] First admin account created and tested
- [ ] Test an end-to-end order with M-Pesa (small amount, real phone)
- [ ] Verify the M-Pesa callback is received (check payment log in admin)
- [ ] Verify email notifications work (if configured)
- [ ] Test on mobile devices
- [ ] Verify sitemap is accessible at `/sitemap.xml`
- [ ] Verify `robots.txt` is accessible at `/robots.txt`
