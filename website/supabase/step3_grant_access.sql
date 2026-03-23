-- STEP 3: Grant table access to anon and authenticated roles
-- Run this after step2_fix.sql

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;

GRANT SELECT, INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT ON public.order_items TO anon, authenticated;
GRANT INSERT ON public.payment_logs TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Service role gets everything
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
