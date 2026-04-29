-- ============================================================
-- STEP 2: Row Level Security policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- ── categories: public read ───────────────────────────────
CREATE POLICY "Public read categories" ON public.categories
  FOR SELECT USING (true);

-- ── products: public read active only ────────────────────
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT USING (is_active = true);

-- ── banners: public read active only ─────────────────────
CREATE POLICY "Public read active banners" ON public.banners
  FOR SELECT USING (is_active = true);

-- ── delivery_zones: public read active only ───────────────
CREATE POLICY "Public read active zones" ON public.delivery_zones
  FOR SELECT USING (is_active = true);

-- ── profiles: users manage own profile ───────────────────
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── orders: customers manage own orders ──────────────────
CREATE POLICY "Customers insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers read own orders" ON public.orders
  FOR SELECT USING (customer_id = auth.uid());

-- ── order_items: customers read own ──────────────────────
CREATE POLICY "Customers read own order items" ON public.order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM public.orders WHERE customer_id = auth.uid()
    )
  );

CREATE POLICY "Insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- ── Grant anon/authenticated access ──────────────────────
GRANT SELECT ON public.categories     TO anon, authenticated;
GRANT SELECT ON public.products       TO anon, authenticated;
GRANT SELECT ON public.banners        TO anon, authenticated;
GRANT SELECT ON public.delivery_zones TO anon, authenticated;
GRANT SELECT, INSERT ON public.orders      TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT, UPDATE ON public.profiles    TO authenticated;
