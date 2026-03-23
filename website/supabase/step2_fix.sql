-- STEP 2 FIX: Drop bad policies, recreate without recursion
-- Run this in Supabase SQL Editor

-- Drop all existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ============================================
-- PROFILES: Use auth.jwt() to avoid recursion
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- CATEGORIES: Public read, admin write via JWT role check
-- ============================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_admin"
  ON public.categories FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- PRODUCTS: Public read active, admin write
-- ============================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (is_active = true);

CREATE POLICY "products_admin"
  ON public.products FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- ORDERS: Owner read, anyone insert, admin all
-- ============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_admin"
  ON public.orders FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- ORDER ITEMS: Linked to order owner, anyone insert
-- ============================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

CREATE POLICY "order_items_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_admin"
  ON public.order_items FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- PAYMENT LOGS: Admin only + service insert
-- ============================================
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payment_logs_insert"
  ON public.payment_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "payment_logs_admin"
  ON public.payment_logs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- VERIFY: Check seed data exists
-- ============================================
DO $$
DECLARE
  cat_count INTEGER;
  prod_count INTEGER;
BEGIN
  SELECT count(*) INTO cat_count FROM public.categories;
  SELECT count(*) INTO prod_count FROM public.products;
  RAISE NOTICE 'Categories: %, Products: %', cat_count, prod_count;
END $$;
