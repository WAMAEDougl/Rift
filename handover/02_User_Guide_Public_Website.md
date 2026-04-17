# 02 — User Guide: Public Website

**Audience:** Customers, General Public, and Ayola Staff who handle customer queries  
**Website:** https://ayolafoods.com

---

## 1. Navigation

### Navbar (top of every page)

| Link | Goes to |
|---|---|
| **AyolaFoods** (logo) | Homepage `/` |
| **Products** | Products & menu catalogue `/products` |
| **Recipes** | Recipes & videos `/recipes` |
| **Community** | Community page `/community` |
| **About** | About Ayola & founder story `/about` |
| **Contact** | Contact form `/contact` |
| **Order Now** (orange button) | Products page `/products` |
| **🛒 Cart icon** | Opens the cart sidebar |
| **🔍 Search icon** | Opens product search modal |
| **☀️/🌙 Theme toggle** | Switches between light and dark mode |

**Promo bar (above navbar):** Shows "Free delivery over KES 2,000 · 4.8 rating from 1,400+ customers" and welcomes back returning customers by their first name.

### Footer Links

**Explore column:**
- Products & Menu → `/products`
- Recipes & Videos → `/recipes`
- Health Hub → `/health-hub`
- Community → `/community`
- Wholesale → `/wholesale`
- FAQ → `/faq`

**Visit & Order column:**
- Visit Us → `/visit-us`
- Contact → `/contact`
- About Ayola → `/about`
- Blog → `/blog`

**Footer bottom bar:**
- Privacy → `/privacy`
- Terms → `/terms`
- Returns → `/returns`

---

## 2. Homepage (`/`)

When a customer visits the website they arrive at the homepage showing:

- **Promo bar** — Free delivery threshold and rating
- **Hero section** — "Eat Healthy. Enjoy Life." tagline with three CTA buttons:
  - **Explore Products** → `/products`
  - **Visit Us** → `/visit-us`
  - **Order Now** → Opens WhatsApp chat to `+254 713 280 550`
- **Stats strip** — 1,400+ customers, 14+ products, 47 counties, 4.8 rating
- **Category cards** — Four product categories (Meals, Beverages, Packaged Products, Flour Blends)
- **Why Ayola** — Brand values (Food Scientist Led, Gut Health First, Locally Sourced, Heritage Innovation)
- **Founder story** — About Prisca Kiragu (JKUAT Food Scientist)
- **Customer testimonials** — Scrolling carousel
- **Final CTA** — Shop Products, Watch Recipes, WhatsApp Us buttons

---

## 3. Products Page (`/products`)

Customers can browse the full catalogue:
- **Filter tabs** — All, by category (Meals, Beverages, Packaged, Flour Blends)
- **Search** — Product name search
- Product cards show: image, name, price (KES), category badge, stock status badge

### Product Detail Page (`/products/[slug]`)

Each product has its own page showing:
- Name, price, size, and short description
- Long description / full product info
- **Nutrition highlights** tags (e.g., "High in Probiotics", "Rich in Iron")
- **Ingredients** list
- **Features / benefits** tags
- **Add to Cart** button — disabled if out of stock; shows "Out of Stock" badge

---

## 4. Cart (slide-out sidebar)

Accessed via the **🛒 bag icon** in the navbar. Opens as a slide-out panel on the right showing:
- All items added with quantity controls (+/−) and remove button
- Subtotal
- **Checkout** button → goes to `/checkout`

Cart state is saved in the browser (persists across page navigation but clears after checkout).

---

## 5. Checkout (`/checkout`)

Single-page checkout collecting:

### Contact Details
| Field | Required | Notes |
|---|---|---|
| Full Name | ✅ | Customer's name |
| Phone Number | ✅ | Used for M-Pesa STK push and delivery contact |
| Email Address | Optional | For order confirmation |

### Delivery Details
| Field | Required | Notes |
|---|---|---|
| Delivery Type | ✅ | Delivery / Pickup / Shipping (countrywide) |
| Delivery Address | ✅ | Street address or area |
| City | ✅ | Defaults to Nairobi |
| Order Notes | Optional | e.g. "Leave at gate", "Call on arrival" |

### Payment Options

**M-Pesa STK Push:**
1. Customer enters their M-Pesa phone number
2. Clicks "Pay with M-Pesa"
3. STK Push prompt appears on their phone
4. Customer enters M-Pesa PIN
5. Page confirms success and shows order ID

**Cash on Delivery:**
1. Customer selects "Cash on Delivery"
2. Order is placed immediately — no upfront payment
3. Customer pays cash on delivery/pickup

---

## 6. Order Success & Tracking

### Order Success Page (`/orders/success`)
Shown after a successful checkout. Displays the order number and next steps.

### Order Tracking (`/orders/track`)
Customers can enter their **Order ID** to track their order status.

**Order status stages:**
1. 🟡 **Pending** — Order received, awaiting confirmation
2. 🔵 **Confirmed** — Ayola has confirmed the order
3. 🟠 **Preparing** — Kitchen is preparing the order
4. 🟣 **Ready** — Order is ready for pickup or dispatch
5. 🔷 **Dispatched** — Rider is on the way (delivery orders only)
6. 🟢 **Delivered** — Order delivered/completed
7. 🔴 **Cancelled** — Order was cancelled (shows reason if provided)

---

## 7. About Page (`/about`)
Ayola's full brand story, founder background (Prisca Kiragu, Food Scientist — JKUAT), and brand mission to revive African heritage ingredients through modern nutrition science.

---

## 8. Health Hub (`/health-hub`)
Educational articles about gut health, probiotics, fermentation science, and African superfoods. Written by the Ayola food science team.

---

## 9. Recipes (`/recipes` and `/recipes/[slug]`)
Recipe library showing how to cook with Ayola's flour blends and other products. Includes videos. Each recipe has its own detail page.

---

## 10. Blog (`/blog` and `/blog/[slug]`)
General news and updates from Ayola Foods. Each article has its own detail page.

---

## 11. Community (`/community`)
Community events, partnerships, customer stories, and the **newsletter signup** (also in the footer). Joining the community gets customers weekly recipes, health tips, and a free gut health guide.

---

## 12. FAQ (`/faq`)
Answers to frequently asked questions about ordering, delivery, ingredients, shelf life, and more.

---

## 13. Wholesale (`/wholesale`)
Bulk/wholesale enquiry page for schools, hospitals, hotels, and institutions.

---

## 14. Visit Us (`/visit-us`)
Restaurant address, operating hours, and a Google Maps embed.

**Ayola Restaurant Address:**
> Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari  
> Near Quickmatt Supermarket, Along Thika Road, Nairobi

**Google Maps:** [View on Maps](https://www.google.com/maps/place/ayolafoodke/data=!4m2!3m1!1s0x182f3ffd56859239:0xb5741c3010640f68)

---

## 15. Contact (`/contact`)
Contact form, and all Ayola contact details.

| Channel | Details |
|---|---|
| **Phone 1** | 0713 280 550 |
| **Phone 2** | 0723 846 724 |
| **Email** | ayola.foods.kenya@gmail.com |
| **WhatsApp** | wa.me/254713280550 |
| **Address** | Ruhan Plaza, Kahawa Sukari, Ground Floor Room 23 |

---

## 16. Social Media (`/community` + Footer)

| Platform | Handle / Link |
|---|---|
| **Facebook** | [Ayola Foods Kenya](https://www.facebook.com/p/Ayola-Foods-Kenya-100087278121034/) — 1,471 likes |
| **Instagram** | [@ayolafoods](https://www.instagram.com/ayolafoods/) |
| **TikTok** | [@priscakiragu](https://www.tiktok.com/@priscakiragu) |
| **YouTube** | [Ayola Foods Channel](https://www.youtube.com/watch?v=0RmZ4vwpAME) |

---

## 17. Legal Pages

| Page | URL |
|---|---|
| Privacy Policy | `/privacy` |
| Terms & Conditions | `/terms` |
| Returns Policy | `/returns` |

---

## 18. Theme & Accessibility

- Supports **Light Mode** and **Dark Mode** — follows system preference by default; user can toggle manually with the ☀️/🌙 icon in the navbar
- Fully **responsive** — works on all screen sizes (mobile, tablet, desktop)
- **Floating WhatsApp button** (bottom-right of every page) for quick customer contact
- **Search modal** (🔍 icon in navbar) for product search
- **Sitemap** available at `/sitemap.xml` for search engines
- **robots.txt** at `/robots.txt`

---

## 19. Complete Public Route Map

```
/                        ← Homepage
/products                ← Product catalogue (filterable by category)
/products/[slug]         ← Individual product detail page
/cart                    ← Cart page (also accessible via sidebar)
/checkout                ← Checkout (contact + delivery + payment)
/orders/success          ← Post-checkout success / order confirmation
/orders/track            ← Order tracking by order ID
/about                   ← Founder story & brand mission
/health-hub              ← Health & nutrition articles
/recipes                 ← Recipe library listing
/recipes/[slug]          ← Individual recipe detail page
/blog                    ← Blog article listing
/blog/[slug]             ← Individual blog post
/community               ← Community page + newsletter signup
/contact                 ← Contact form
/visit-us                ← Restaurant location & map
/faq                     ← Frequently asked questions
/wholesale               ← Wholesale enquiry
/privacy                 ← Privacy policy
/terms                   ← Terms & conditions
/returns                 ← Returns policy
/sitemap.xml             ← Auto-generated sitemap
/robots.txt              ← Search engine crawler rules
```
