-- ============================================================
-- STEP 1: Create all tables, indexes, triggers
-- Run this first on a fresh Supabase project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  email           text,
  role            text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'kitchen')),
  default_address text,
  default_city    text DEFAULT 'Nairobi',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             text UNIQUE NOT NULL,
  name             text NOT NULL,
  tagline          text,
  icon             text,
  description      text,
  color            text,
  bg_color         text,
  ships_countrywide boolean NOT NULL DEFAULT false,
  price_from       integer,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id            text UNIQUE,
  slug                 text UNIQUE NOT NULL,
  name                 text NOT NULL,
  category_id          uuid NOT NULL REFERENCES public.categories(id),
  description          text,
  long_description     text,
  price                integer NOT NULL,
  size                 text,
  image_url            text,
  features             text[] NOT NULL DEFAULT '{}',
  ingredients          text,
  nutrition_highlights text[] NOT NULL DEFAULT '{}',
  badge                text,
  in_stock             boolean NOT NULL DEFAULT true,
  is_active            boolean NOT NULL DEFAULT true,
  sort_order           integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);

-- ── orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number                text UNIQUE NOT NULL,
  customer_id                 uuid REFERENCES public.profiles(id),
  status                      text NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','confirmed','preparing','ready','dispatched','delivered','cancelled')),
  customer_name               text NOT NULL,
  customer_phone              text NOT NULL,
  customer_email              text,
  delivery_address            text NOT NULL,
  delivery_city               text NOT NULL DEFAULT 'Nairobi',
  delivery_type               text NOT NULL DEFAULT 'delivery'
                                CHECK (delivery_type IN ('delivery','pickup','shipping')),
  order_notes                 text,
  subtotal                    integer NOT NULL,
  delivery_fee                integer NOT NULL DEFAULT 0,
  total                       integer NOT NULL,
  payment_method              text NOT NULL CHECK (payment_method IN ('mpesa','cash_on_delivery','whatsapp')),
  payment_status              text NOT NULL DEFAULT 'pending'
                                CHECK (payment_status IN ('pending','processing','completed','failed','refunded')),
  mpesa_checkout_request_id   text,
  mpesa_receipt_number        text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  confirmed_at                timestamptz,
  completed_at                timestamptz
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- ── order_items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id),
  product_name  text NOT NULL,
  product_price integer NOT NULL,
  quantity      integer NOT NULL CHECK (quantity > 0),
  line_total    integer NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

-- ── payment_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    uuid REFERENCES public.orders(id),
  provider    text NOT NULL DEFAULT 'mpesa',
  event_type  text NOT NULL,
  raw_payload jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       text NOT NULL CHECK (type IN ('new_order','payment_completed','payment_failed','order_cancelled')),
  title      text NOT NULL,
  message    text NOT NULL,
  order_id   uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);

-- ── store_settings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                          integer PRIMARY KEY CHECK (id = 1),
  store_name                  text NOT NULL DEFAULT 'Ayola Foods KE',
  support_email               text,
  support_phone               text,
  default_delivery_fee        integer NOT NULL DEFAULT 150,
  delivery_cities             text[] NOT NULL DEFAULT ARRAY['Nairobi'],
  order_notification_emails   text[] NOT NULL DEFAULT '{}',
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- ── banners ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  subtitle         text,
  description      text,
  image_url        text NOT NULL,
  mobile_image_url text,
  link_url         text,
  link_text        text,
  position         text NOT NULL DEFAULT 'hero'
                     CHECK (position IN ('hero','promo_strip','middle','footer')),
  sort_order       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  starts_at        timestamptz,
  ends_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── delivery_zones ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text NOT NULL,
  description    text,
  areas          text[] NOT NULL DEFAULT '{}',
  fee            integer NOT NULL DEFAULT 0,
  free_above     integer,
  estimated_days text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at triggers ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.delivery_zones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

-- ── auto-create profile on signup ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

DO $ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $;


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


-- ============================================================
-- STEP 3: Seed data — categories, products, orders, settings
-- ============================================================

-- ── Store settings ────────────────────────────────────────
INSERT INTO public.store_settings (id, store_name, support_email, support_phone, default_delivery_fee, delivery_cities, order_notification_emails)
VALUES (1, 'Ayola Foods KE', 'hello@ayolafoods.co.ke', '+254713280550', 150,
  ARRAY['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  ARRAY['admin@ayolafoods.co.ke']
)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  support_email = EXCLUDED.support_email,
  support_phone = EXCLUDED.support_phone;

-- ── Categories ────────────────────────────────────────────
INSERT INTO public.categories (id, slug, name, tagline, icon, description, color, bg_color, ships_countrywide, price_from, sort_order)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'meals', 'Meals',
   'Healthy, unconventional, delicious', '🍽️',
   'Nutritious meal combos featuring unconventional proteins, heritage ugali, and gut-friendly sides.',
   'from-amber-500 to-orange-600', 'bg-amber-50', false, 1200, 1),

  ('11111111-0000-0000-0000-000000000002', 'beverages', 'Beverages',
   'Gut health in every sip', '🥤',
   'Fermented drinks and probiotic beverages formulated by a food scientist for digestive health.',
   'from-green-500 to-emerald-600', 'bg-green-50', true, 400, 2),

  ('11111111-0000-0000-0000-000000000003', 'breakfast', 'Breakfast',
   'Start your day right', '🍳',
   'Healthy breakfast combos and light meal options to fuel your morning the Ayola way.',
   'from-yellow-500 to-amber-500', 'bg-yellow-50', false, 650, 3),

  ('11111111-0000-0000-0000-000000000004', 'packaged', 'Packaged',
   'Heritage grains, delivered anywhere', '📦',
   'Heritage flour blends, fermented grain mixes, and pantry essentials shipped to all 47 counties.',
   'from-purple-500 to-violet-600', 'bg-purple-50', true, 850, 4)
ON CONFLICT (slug) DO NOTHING;

-- ── Products ──────────────────────────────────────────────
INSERT INTO public.products (id, legacy_id, slug, name, category_id, description, long_description, price, size, image_url, features, ingredients, nutrition_highlights, badge, in_stock, is_active, sort_order)
VALUES
  -- MEALS
  ('22222222-0000-0000-0000-000000000001', 'heritage-jollof', 'heritage-jollof', 'Heritage Jollof',
   '11111111-0000-0000-0000-000000000001',
   'Smoky, slow-cooked rice infused with sun-ripened highland peppers, native bay and a whisper of locust bean.',
   'Our Heritage Jollof is a celebration of West African culinary tradition — slow-cooked rice infused with sun-ripened highland peppers, native bay leaf, and a whisper of locust bean. Every grain absorbs the deep, smoky flavors of our signature spice blend.',
   1200, 'Full serving',
   'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80&auto=format&fit=crop',
   ARRAY['Vegan', 'Slow-Cooked', 'Signature Spice Blend'],
   'Basmati rice, highland peppers, native bay leaf, locust bean, natural spices',
   ARRAY['Plant-based', 'No MSG', 'Rich in antioxidants'],
   'Vegan', true, true, 1),

  ('22222222-0000-0000-0000-000000000002', 'rabbit-wet-fry', 'rabbit-wet-fry', 'Rabbit Wet Fry',
   '11111111-0000-0000-0000-000000000001',
   'Tender free-range rabbit slow-cooked in a rich tomato and herb sauce. High protein, low fat.',
   'Our Rabbit Wet Fry features free-range rabbit slow-cooked in a rich tomato, onion and herb sauce. Rabbit is one of the leanest, most sustainable proteins available — high in protein, low in fat, and deeply flavorful when cooked the Ayola way.',
   1450, 'Full serving',
   'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&auto=format&fit=crop',
   ARRAY['High Protein', 'Low Fat', 'Free-Range'],
   'Free-range rabbit, tomatoes, onions, garlic, ginger, native herbs, natural spices',
   ARRAY['High protein', 'Low fat', 'Rich in B12'],
   'Chef''s Pick', true, true, 2),

  ('22222222-0000-0000-0000-000000000003', 'turkey-egg-omelette', 'turkey-egg-omelette', 'Turkey Egg Omelette',
   '11111111-0000-0000-0000-000000000001',
   'Fluffy omelette made with nutrient-dense turkey eggs, garden vegetables and heritage spices.',
   'Turkey eggs are larger, richer and more nutritious than chicken eggs — packed with protein, healthy fats and micronutrients. Our omelette combines them with fresh garden vegetables and a blend of heritage spices for a deeply satisfying meal.',
   950, 'Full serving',
   'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&q=80&auto=format&fit=crop',
   ARRAY['High Protein', 'Nutrient-Dense', 'Unconventional'],
   'Turkey eggs, bell peppers, onions, tomatoes, spinach, heritage spice blend',
   ARRAY['High protein', 'Rich in omega-3', 'Vitamin D'],
   'Rare Find', true, true, 3),

  -- BEVERAGES
  ('22222222-0000-0000-0000-000000000004', 'plantain-kvass', 'plantain-kvass', 'Plantain Probiotic Kvass',
   '11111111-0000-0000-0000-000000000002',
   'Kenya''s first plantain-fermented probiotic beverage. Gut-healing, naturally fizzy, zero sugar added.',
   'Our Plantain Probiotic Kvass is a world first — a naturally fermented beverage made from ripe plantains, rich in live probiotic cultures that support gut health, immunity and digestion. Lightly fizzy, subtly sweet, and completely natural.',
   550, '330ml bottle',
   'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80&auto=format&fit=crop',
   ARRAY['Probiotic', 'Zero Sugar Added', 'Gut Health'],
   'Ripe plantains, filtered water, natural fermentation cultures',
   ARRAY['Live probiotics', 'No added sugar', 'Gut-healing'],
   'World First', true, true, 1),

  ('22222222-0000-0000-0000-000000000005', 'goat-milk-tea', 'goat-milk-tea', 'Goat Milk Masala Tea',
   '11111111-0000-0000-0000-000000000002',
   'Rich, creamy masala chai brewed with fresh goat milk. Easier to digest than cow milk.',
   'Goat milk is naturally homogenized, easier to digest, and richer in calcium and vitamins than cow milk. Our Masala Tea blends it with a warming spice mix of cardamom, ginger, cinnamon and cloves for a deeply comforting, gut-friendly drink.',
   400, 'Per serving',
   'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop',
   ARRAY['Gut-Friendly', 'Natural', 'Probiotic-Rich'],
   'Fresh goat milk, black tea, cardamom, ginger, cinnamon, cloves, natural sweetener',
   ARRAY['Easier to digest', 'Rich in calcium', 'Anti-inflammatory'],
   NULL, true, true, 2),

  ('22222222-0000-0000-0000-000000000006', 'synbiotic-porridge', 'synbiotic-porridge', 'Synbiotic Porridge',
   '11111111-0000-0000-0000-000000000002',
   'Fermented finger millet porridge with live cultures and prebiotic fiber. Science-backed gut health.',
   'Our Synbiotic Porridge combines the prebiotic power of fermented finger millet with live probiotic cultures — a synbiotic combination that feeds and replenishes your gut microbiome simultaneously. Formulated by our in-house food scientist.',
   480, 'Per serving',
   'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&q=80&auto=format&fit=crop',
   ARRAY['Synbiotic', 'Fermented', 'Science-Backed'],
   'Fermented finger millet, live probiotic cultures, prebiotic inulin, natural flavors',
   ARRAY['Synbiotic formula', 'High in iron', 'Gluten-free'],
   'Science Pick', true, true, 3),

  -- BREAKFAST
  ('22222222-0000-0000-0000-000000000007', 'heritage-ugali-breakfast', 'heritage-ugali-breakfast', 'Heritage Ugali Breakfast',
   '11111111-0000-0000-0000-000000000003',
   'Stone-ground sorghum and millet ugali served with free-range eggs and fermented vegetables.',
   'Our Heritage Ugali Breakfast uses stone-ground sorghum and millet flour — ancient grains with a lower glycemic index than refined maize. Served with free-range eggs and a side of fermented vegetables for a complete, gut-friendly morning meal.',
   850, 'Full serving',
   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80&auto=format&fit=crop',
   ARRAY['Heritage Grains', 'Low GI', 'Fermented Sides'],
   'Stone-ground sorghum, millet flour, free-range eggs, fermented kale, natural spices',
   ARRAY['Low glycemic index', 'High fiber', 'Rich in iron'],
   NULL, true, true, 1),

  ('22222222-0000-0000-0000-000000000008', 'golden-puffs', 'golden-puffs', 'Golden Puffs',
   '11111111-0000-0000-0000-000000000003',
   'Artisanal yeasted dough balls, fried until amber and finished with a warm ginger glaze.',
   'Golden Puffs are artisanal yeasted dough balls, fried until perfectly amber and finished with a warm ginger glaze. A beloved breakfast treat that combines the comfort of fresh-fried dough with the warmth of ginger.',
   650, 'Per serving (6 pcs)',
   'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80&auto=format&fit=crop',
   ARRAY['Artisanal', 'Fresh-Made', 'Ginger Glaze'],
   'Wheat flour, yeast, ginger, natural sweetener, cooking oil',
   ARRAY['Fresh ingredients', 'No preservatives', 'Artisanal quality'],
   NULL, true, true, 2),

  -- PACKAGED
  ('22222222-0000-0000-0000-000000000009', 'finger-millet-flour', 'finger-millet-flour', 'Finger Millet Flour',
   '11111111-0000-0000-0000-000000000004',
   'Stone-ground finger millet (wimbi) flour. Rich in calcium, iron and natural probiotics when fermented.',
   'Our Finger Millet Flour is stone-ground from heritage wimbi varieties sourced from smallholder farms in the Rift Valley. Rich in calcium (higher than milk per gram), iron, and amino acids. Ships to all 47 counties.',
   850, '1kg pack',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80&auto=format&fit=crop',
   ARRAY['Stone-Ground', 'Heritage Variety', 'Ships Countrywide'],
   '100% stone-ground finger millet (wimbi)',
   ARRAY['Higher calcium than milk', 'Rich in iron', 'Gluten-free'],
   'Best Seller', true, true, 1),

  ('22222222-0000-0000-0000-000000000010', 'sorghum-flour', 'sorghum-flour', 'Sorghum Flour Blend',
   '11111111-0000-0000-0000-000000000004',
   'Heritage sorghum flour blended with amaranth. Low GI, high protein, perfect for ugali and porridge.',
   'Our Sorghum Flour Blend combines heritage sorghum with amaranth grain for a nutritionally complete flour. Lower glycemic index than maize flour, higher in protein, and naturally gluten-free. Perfect for ugali, porridge, and baking.',
   950, '1kg pack',
   'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80&auto=format&fit=crop',
   ARRAY['Low GI', 'High Protein', 'Gluten-Free', 'Ships Countrywide'],
   'Stone-ground sorghum (70%), amaranth grain (30%)',
   ARRAY['Low glycemic index', 'High protein', 'Rich in antioxidants'],
   NULL, true, true, 2)

ON CONFLICT (slug) DO NOTHING;

-- ── Delivery zones ────────────────────────────────────────
INSERT INTO public.delivery_zones (name, description, areas, fee, free_above, estimated_days, is_active)
VALUES
  ('Nairobi CBD & Westlands', 'Central Nairobi and Westlands area', ARRAY['CBD', 'Westlands', 'Parklands', 'Upperhill', 'Kilimani'], 100, 2000, '1-2 hours', true),
  ('Nairobi Suburbs', 'Nairobi suburbs and satellite towns', ARRAY['Kahawa Sukari', 'Kasarani', 'Ruaka', 'Kikuyu', 'Rongai', 'Ngong', 'Kitengela'], 150, 2500, '2-4 hours', true),
  ('Mombasa', 'Mombasa island and mainland', ARRAY['Mombasa Island', 'Nyali', 'Bamburi', 'Likoni'], 350, 5000, '1-2 days', true),
  ('Countrywide Shipping', 'All other counties via courier', ARRAY['All 47 counties'], 500, 8000, '2-4 days', true)
ON CONFLICT DO NOTHING;

-- ── Store settings ────────────────────────────────────────
INSERT INTO public.store_settings (id, store_name, support_email, support_phone, default_delivery_fee, delivery_cities, order_notification_emails)
VALUES (1, 'Ayola Foods KE', 'hello@ayolafoods.co.ke', '+254713280550', 150,
  ARRAY['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  ARRAY['admin@ayolafoods.co.ke']
)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name;

-- ── Mock orders ───────────────────────────────────────────
INSERT INTO public.orders (id, order_number, status, customer_name, customer_phone, customer_email, delivery_address, delivery_city, delivery_type, subtotal, delivery_fee, total, payment_method, payment_status, mpesa_receipt_number, created_at, confirmed_at)
VALUES
  ('33333333-0000-0000-0000-000000000001', 'AYF-001001', 'delivered', 'Wanjiku Kamau', '+254712345678', 'wanjiku@gmail.com', 'Kahawa Sukari, Ruhan Plaza', 'Nairobi', 'delivery', 2150, 150, 2300, 'mpesa', 'completed', 'QHF2A1B3C4', now() - interval '5 days', now() - interval '5 days' + interval '30 minutes'),
  ('33333333-0000-0000-0000-000000000002', 'AYF-001002', 'confirmed', 'Otieno Odhiambo', '+254723456789', 'otieno@gmail.com', 'Westlands, Sarit Centre area', 'Nairobi', 'delivery', 1200, 100, 1300, 'mpesa', 'completed', 'QHF2B2C3D5', now() - interval '2 days', now() - interval '2 days' + interval '1 hour'),
  ('33333333-0000-0000-0000-000000000003', 'AYF-001003', 'pending', 'Aisha Mohamed', '+254734567890', 'aisha@gmail.com', 'Kilimani, Argwings Kodhek Rd', 'Nairobi', 'delivery', 1800, 150, 1950, 'whatsapp', 'pending', NULL, now() - interval '3 hours', NULL),
  ('33333333-0000-0000-0000-000000000004', 'AYF-001004', 'preparing', 'Kipchoge Ruto', '+254745678901', NULL, 'Rongai, Tumaini area', 'Nairobi', 'delivery', 2400, 150, 2550, 'mpesa', 'completed', 'QHF2C3D4E6', now() - interval '1 day', now() - interval '23 hours'),
  ('33333333-0000-0000-0000-000000000005', 'AYF-001005', 'cancelled', 'Njeri Mwangi', '+254756789012', 'njeri@gmail.com', 'Kasarani, Mwiki Rd', 'Nairobi', 'delivery', 950, 150, 1100, 'cash_on_delivery', 'pending', NULL, now() - interval '4 days', NULL),
  ('33333333-0000-0000-0000-000000000006', 'AYF-001006', 'dispatched', 'Fatuma Hassan', '+254767890123', 'fatuma@gmail.com', 'Mombasa, Nyali Bridge area', 'Mombasa', 'shipping', 1700, 350, 2050, 'mpesa', 'completed', 'QHF2D4E5F7', now() - interval '3 days', now() - interval '3 days' + interval '2 hours'),
  ('33333333-0000-0000-0000-000000000007', 'AYF-001007', 'delivered', 'Samuel Kiprotich', '+254778901234', NULL, 'Eldoret, Uganda Rd', 'Eldoret', 'shipping', 1800, 500, 2300, 'mpesa', 'completed', 'QHF2E5F6G8', now() - interval '7 days', now() - interval '7 days' + interval '45 minutes'),
  ('33333333-0000-0000-0000-000000000008', 'AYF-001008', 'confirmed', 'Grace Wambui', '+254789012345', 'grace@gmail.com', 'Nakuru, Section 58', 'Nakuru', 'shipping', 2750, 500, 3250, 'mpesa', 'completed', 'QHF2F6G7H9', now() - interval '1 day', now() - interval '22 hours')
ON CONFLICT (order_number) DO NOTHING;

-- ── Order items ───────────────────────────────────────────
INSERT INTO public.order_items (order_id, product_id, product_name, product_price, quantity, line_total)
VALUES
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001', 'Heritage Jollof', 1200, 1, 1200),
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000005', 'Goat Milk Masala Tea', 400, 1, 400),
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000008', 'Golden Puffs', 650, 1, 650),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001', 'Heritage Jollof', 1200, 1, 1200),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000002', 'Rabbit Wet Fry', 1450, 1, 1450),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000006', 'Synbiotic Porridge', 480, 1, 480),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000002', 'Rabbit Wet Fry', 1450, 1, 1450),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000004', 'Plantain Probiotic Kvass', 550, 1, 550),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000008', 'Golden Puffs', 650, 1, 650),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000003', 'Turkey Egg Omelette', 950, 1, 950),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000009', 'Finger Millet Flour', 850, 1, 850),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000010', 'Sorghum Flour Blend', 950, 1, 950),
  ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000009', 'Finger Millet Flour', 850, 1, 850),
  ('33333333-0000-0000-0000-000000000007', '22222222-0000-0000-0000-000000000010', 'Sorghum Flour Blend', 950, 1, 950),
  ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000009', 'Finger Millet Flour', 850, 2, 1700),
  ('33333333-0000-0000-0000-000000000008', '22222222-0000-0000-0000-000000000010', 'Sorghum Flour Blend', 950, 1, 950)
ON CONFLICT DO NOTHING;

-- ── Notifications ─────────────────────────────────────────
INSERT INTO public.notifications (type, title, message, order_id, is_read, created_at)
VALUES
  ('new_order', 'New Order #AYF-001008', 'Grace Wambui placed an order for KES 3,250 from Nakuru.', '33333333-0000-0000-0000-000000000008', false, now() - interval '1 day'),
  ('payment_completed', 'Payment Received #AYF-001007', 'M-Pesa payment of KES 2,300 confirmed. Receipt: QHF2E5F6G8', '33333333-0000-0000-0000-000000000007', false, now() - interval '7 days'),
  ('new_order', 'New Order #AYF-001003', 'Aisha Mohamed placed an order for KES 1,950 from Kilimani.', '33333333-0000-0000-0000-000000000003', false, now() - interval '3 hours'),
  ('order_cancelled', 'Order #AYF-001005 Cancelled', 'Njeri Mwangi cancelled their order of KES 1,100.', '33333333-0000-0000-0000-000000000005', true, now() - interval '4 days'),
  ('payment_completed', 'Payment Received #AYF-001006', 'M-Pesa payment of KES 2,050 confirmed. Receipt: QHF2D4E5F7', '33333333-0000-0000-0000-000000000006', true, now() - interval '3 days')
ON CONFLICT DO NOTHING;

-- ── Banner ────────────────────────────────────────────────
INSERT INTO public.banners (title, subtitle, description, image_url, position, sort_order, is_active, link_url, link_text)
VALUES
  ('Heritage Flavours, Modern Nutrition', 'Nairobi''s most unconventional food brand', 'Rabbit, turkey eggs, probiotic beverages and heritage grain flours — crafted by a food scientist.',
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop',
   'hero', 1, true, '/shop', 'Shop Now'),

  ('Gut Health Starts Here', 'Kenya''s first plantain probiotic kvass', 'Science-backed fermented beverages that heal your gut and boost immunity. Made fresh in Nairobi.',
   'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200&q=80&auto=format&fit=crop',
   'hero', 2, true, '/shop', 'Try Our Beverages'),

  ('Heritage Grains, Delivered Anywhere', 'Stone-ground finger millet & sorghum flour', 'Sourced from smallholder farms in the Rift Valley. Ships to all 47 counties.',
   'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&q=80&auto=format&fit=crop',
   'hero', 3, true, '/shop', 'Order Flour'),

  ('Rabbit Wet Fry — Try Something New', 'High protein, low fat, deeply flavourful', 'Free-range rabbit slow-cooked in a rich tomato and herb sauce. The most sustainable protein you''ve never tried.',
   'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=80&auto=format&fit=crop',
   'hero', 4, true, '/shop', 'Order Now'),

  ('Free Delivery on Orders Over KES 2,000', 'Within Nairobi — same day delivery available', NULL,
   'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&q=80&auto=format&fit=crop',
   'promo_strip', 1, true, '/shop', 'Order Now'),

  ('New: Synbiotic Porridge', 'Science-backed gut health in every bowl', 'Fermented finger millet with live probiotic cultures. Formulated by our in-house food scientist.',
   'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1200&q=80&auto=format&fit=crop',
   'middle', 1, true, '/products/synbiotic-porridge', 'Learn More'),

  ('Visit Us in Kahawa Sukari', 'Ruhan Plaza, Ground Floor Room 23', 'Open Mon–Sat 7AM–8PM. Come taste the full menu in person.',
   'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop',
   'footer', 1, true, '/visit-us', 'Get Directions')

ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 4: Create admin user account
-- Run this AFTER creating the user via Supabase Auth dashboard
-- OR use the SQL below to insert directly into auth.users
-- ============================================================

-- OPTION A (Recommended): 
-- 1. Go to Supabase → Authentication → Users → "Add user"
-- 2. Email: admin@ayolafoods.co.ke  Password: Admin@Ayola2024!
-- 3. Then run ONLY the UPDATE below to set the role:

UPDATE public.profiles
SET role = 'admin', full_name = 'Admin'
WHERE email = 'admin@ayolafoods.co.ke';

-- Kitchen staff account (create via Auth dashboard first):
-- Email: kitchen@ayolafoods.co.ke  Password: Kitchen@Ayola2024!
UPDATE public.profiles
SET role = 'kitchen', full_name = 'Kitchen Staff'
WHERE email = 'kitchen@ayolafoods.co.ke';


-- ============================================================
-- OPTION B: Direct insert (only if Option A doesn't work)
-- This bypasses the normal auth flow — use with caution
-- ============================================================

-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
-- VALUES (
--   uuid_generate_v4(),
--   'admin@ayolafoods.co.ke',
--   crypt('Admin@Ayola2024!', gen_salt('bf')),
--   now(),
--   'authenticated',
--   'authenticated'
-- );


-- ============================================================
-- STEP 5: Extend store_settings + add FAQs + Testimonials
-- Run this after step3_seed.sql
-- ============================================================

-- ── Extend store_settings with new columns ────────────────
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS tagline              text,
  ADD COLUMN IF NOT EXISTS whatsapp_number      text,
  ADD COLUMN IF NOT EXISTS address              text,
  ADD COLUMN IF NOT EXISTS city                 text DEFAULT 'Nairobi',
  ADD COLUMN IF NOT EXISTS country              text DEFAULT 'Kenya',
  ADD COLUMN IF NOT EXISTS currency             text DEFAULT 'KES',
  ADD COLUMN IF NOT EXISTS free_shipping_threshold integer DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS low_stock_threshold  integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS tax_rate             numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_inclusive        boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS allow_guest_checkout boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS new_order_sound_enabled    boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS new_message_sound_enabled  boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS primary_color        text,
  ADD COLUMN IF NOT EXISTS secondary_color      text,
  ADD COLUMN IF NOT EXISTS accent_color         text,
  ADD COLUMN IF NOT EXISTS font_heading         text,
  ADD COLUMN IF NOT EXISTS font_body            text,
  ADD COLUMN IF NOT EXISTS logo_url             text,
  ADD COLUMN IF NOT EXISTS favicon_url          text,
  ADD COLUMN IF NOT EXISTS store_description    text,
  ADD COLUMN IF NOT EXISTS mpesa_shortcode      text,
  ADD COLUMN IF NOT EXISTS mpesa_environment    text DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS wasender_api_key     text,
  ADD COLUMN IF NOT EXISTS wasender_phone_id    text,
  -- Social media
  ADD COLUMN IF NOT EXISTS facebook_url         text,
  ADD COLUMN IF NOT EXISTS instagram_url        text,
  ADD COLUMN IF NOT EXISTS tiktok_url           text,
  ADD COLUMN IF NOT EXISTS youtube_url          text,
  ADD COLUMN IF NOT EXISTS instagram_handle     text,
  ADD COLUMN IF NOT EXISTS tiktok_handle        text,
  -- Operating hours (JSON)
  ADD COLUMN IF NOT EXISTS opening_hours        jsonb,
  -- Hero content
  ADD COLUMN IF NOT EXISTS hero_headline        text,
  ADD COLUMN IF NOT EXISTS hero_subheadline     text,
  ADD COLUMN IF NOT EXISTS hero_description     text,
  ADD COLUMN IF NOT EXISTS hero_cta_text        text,
  ADD COLUMN IF NOT EXISTS hero_cta_url         text,
  -- Stats shown on homepage/about
  ADD COLUMN IF NOT EXISTS stats                jsonb;

-- Seed the extended settings
UPDATE public.store_settings SET
  tagline              = 'Earth-First African Nourishment',
  whatsapp_number      = '254713280550',
  address              = 'Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari',
  city                 = 'Nairobi',
  country              = 'Kenya',
  currency             = 'KES',
  free_shipping_threshold = 2000,
  facebook_url         = 'https://www.facebook.com/p/Ayola-Foods-Kenya-100087278121034/',
  instagram_url        = 'https://www.instagram.com/ayolafoods/',
  instagram_handle     = '@ayolafoods',
  tiktok_url           = 'https://www.tiktok.com/@priscakiragu',
  tiktok_handle        = '@priscakiragu',
  youtube_url          = 'https://www.youtube.com/watch?v=0RmZ4vwpAME',
  opening_hours        = '[
    {"day": "Monday - Friday", "hours": "7:00 AM - 8:00 PM", "is_open": true},
    {"day": "Saturday",        "hours": "7:00 AM - 8:00 PM", "is_open": true},
    {"day": "Sunday",          "hours": "8:00 AM - 6:00 PM", "is_open": true}
  ]'::jsonb,
  hero_headline        = 'Where the Rift feeds the table.',
  hero_subheadline     = 'Earth-first · Est. 2018',
  hero_description     = 'Heritage African cooking, hand-crafted in small batches from the volcanic soils of the Rift Valley. Delivered to your door with care.',
  hero_cta_text        = 'Order Now',
  hero_cta_url         = '/shop',
  stats                = '[
    {"value": "100%", "label": "Organic Heritage"},
    {"value": "42",   "label": "Partner Farms"},
    {"value": "6+",   "label": "Years Crafting"},
    {"value": "47",   "label": "Counties Reached"}
  ]'::jsonb
WHERE id = 1;

-- ── FAQs table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question   text NOT NULL,
  answer     text NOT NULL,
  category   text NOT NULL DEFAULT 'general'
               CHECK (category IN ('ordering','shipping','products','health','restaurant','wholesale','general')),
  sort_order integer NOT NULL DEFAULT 0,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $;

-- RLS for FAQs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active faqs" ON public.faqs
  FOR SELECT USING (is_active = true);
GRANT SELECT ON public.faqs TO anon, authenticated;

-- Seed FAQs
INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
  ('How do I place an order?', 'You can order directly through our website by adding items to your cart and checking out, or order via WhatsApp. We accept orders through both channels.', 'ordering', 1),
  ('What payment methods do you accept?', 'We accept M-Pesa (our primary payment method) and Cash on Delivery for Nairobi orders. M-Pesa payments are processed instantly via STK Push.', 'ordering', 2),
  ('Can I cancel or modify my order?', 'Yes, you can cancel or modify within 15 minutes of placing your order. Contact us on WhatsApp immediately if you need changes.', 'ordering', 3),
  ('Is there a minimum order amount?', 'No minimum for restaurant dine-in or pickup. For delivery within Nairobi, we recommend a minimum of KES 500.', 'ordering', 4),
  ('Do you deliver countrywide?', 'Yes! Our packaged products ship to all 47 counties via courier. Ready meals and beverages are available for delivery within Nairobi only.', 'shipping', 1),
  ('How much does delivery cost?', 'Nairobi delivery: KES 200 (free on orders over KES 2,000). Countrywide shipping varies by location — typically KES 300-500.', 'shipping', 2),
  ('How long does delivery take?', 'Nairobi: 30-90 minutes for ready meals. Countrywide: 1-3 business days for packaged products via courier.', 'shipping', 3),
  ('Are your products natural?', 'Yes, 100%. All products use natural ingredients with no artificial preservatives, no MSG, no artificial colors or flavors.', 'products', 1),
  ('What is synbiotic porridge?', 'Synbiotic means it contains both probiotics (beneficial live bacteria) and prebiotics (food for those bacteria). Our synbiotic porridge delivers both for maximum gut health benefits.', 'products', 2),
  ('Are your products suitable for diabetics?', 'Our heritage grain products have a lower glycemic index than standard refined flour. Please consult your doctor before making dietary changes.', 'health', 1),
  ('Do you have vegan options?', 'Yes! Our Vegetarian/Vegan Combo, all packaged flour blends, plantain kvass, and synbiotic porridge are fully vegan.', 'health', 2),
  ('Where is your restaurant located?', 'Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari — near Quickmatt Supermarket, along Thika Road, Nairobi.', 'restaurant', 1),
  ('What are your operating hours?', 'Monday to Saturday: 7:00 AM - 8:00 PM. Sunday: 8:00 AM - 6:00 PM.', 'restaurant', 2),
  ('Do you sell wholesale?', 'Yes! We offer bulk pricing for our packaged flour blends. Minimum wholesale order is 50 units per product. Contact us for a quote.', 'wholesale', 1)
ON CONFLICT DO NOTHING;

-- ── Testimonials table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  role        text,
  location    text,
  quote       text NOT NULL,
  rating      integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  product     text,
  avatar_url  text,
  is_active   boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active testimonials" ON public.testimonials
  FOR SELECT USING (is_active = true);
GRANT SELECT ON public.testimonials TO anon, authenticated;

-- Seed testimonials
INSERT INTO public.testimonials (name, role, location, quote, rating, product, is_featured, sort_order) VALUES
  ('Wanjiru K.', 'Teacher', 'Westlands, Nairobi', 'The fermented porridge blend has completely changed my mornings. My digestion has improved so much in just 3 weeks. I tell everyone about Ayola!', 5, 'Synbiotic Porridge', true, 1),
  ('Brian O.', 'Fitness Coach', 'Kilimani, Nairobi', 'I started using the ugali blend for my clients and the results are incredible. Lower GI, more protein, and they actually love the taste. Game changer.', 5, 'Finger Millet Flour', true, 2),
  ('Amina S.', 'Nutritionist', 'Mombasa', 'The probiotic kvass is unlike anything I have tasted. Naturally fizzy, not too sweet, and I can feel the difference in my gut health. Ships perfectly too!', 5, 'Plantain Probiotic Kvass', true, 3),
  ('David M.', 'Personal Trainer', 'Thika', 'As a fitness coach, I recommend Ayola rabbit wet fry to all my clients. Highest protein, lowest fat of any meat. My clients love it.', 5, 'Rabbit Wet Fry', false, 4),
  ('Grace N.', 'Nurse', 'Nakuru', 'I order the uji blend every month. My children love it and I love knowing they are getting proper nutrition from heritage grains. Delivery is always on time.', 5, 'Sorghum Flour Blend', false, 5),
  ('Peter L.', 'Entrepreneur', 'Eldoret', 'The goat milk chai is the best tea I have ever had. Creamy, warming, and so much easier on my stomach than regular milk. Worth every shilling.', 5, 'Goat Milk Masala Tea', false, 6)
ON CONFLICT DO NOTHING;


-- ── Banner color columns ──────────────────────────────────
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS title_color       text DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS subtitle_color    text DEFAULT '#e8d5a3',
  ADD COLUMN IF NOT EXISTS description_color text DEFAULT '#ffffffb3';

-- ── Theme column ──────────────────────────────────────────
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS active_theme text DEFAULT 'theme-earth';

UPDATE public.store_settings SET active_theme = 'theme-earth' WHERE id = 1;

-- ── RLS for FAQs and Testimonials (if not already added) ──
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT SELECT ON public.testimonials TO anon, authenticated;


-- ============================================================
-- EXTENDED MOCK DATA: All pages
-- Recipes, Blog Posts, Team Members, Milestones, Values,
-- Health Topics, Wholesale Products, Social Channels
-- ============================================================

-- ── Recipes table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.recipes (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  excerpt         text,
  content         text,
  category        text NOT NULL DEFAULT 'cooking-demo'
                    CHECK (category IN ('cooking-demo','beverage','how-to','health-tip')),
  video_url       text,
  video_platform  text DEFAULT 'youtube'
                    CHECK (video_platform IN ('youtube','facebook','instagram','tiktok')),
  thumbnail_url   text,
  prep_time       text,
  servings        text,
  difficulty      text DEFAULT 'Easy'
                    CHECK (difficulty IN ('Easy','Medium','Advanced')),
  ingredients     text[],
  tags            text[],
  author          text DEFAULT 'Prisca Kiragu',
  published_at    date,
  is_featured     boolean DEFAULT false,
  is_active       boolean DEFAULT true,
  related_product text,
  sort_order      integer DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active recipes" ON public.recipes
  FOR SELECT USING (is_active = true);
GRANT SELECT ON public.recipes TO anon, authenticated;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed recipes
INSERT INTO public.recipes (slug, title, excerpt, content, category, video_url, video_platform, prep_time, servings, difficulty, ingredients, tags, author, published_at, is_featured, related_product, sort_order)
VALUES
  ('ceo-making-pilau', 'CEO Making Pilau — Ayola''s Signature Spiced Rice',
   'Watch Prisca Kiragu prepare Ayola''s signature pilau from scratch — richly spiced, healthy, and absolutely delicious.',
   '## Ayola''s Signature Pilau

Our pilau is one of the most requested dishes at Ayola Foods. CEO and food scientist Prisca Kiragu takes you through the preparation — from toasting the whole spices to the final plating.

### What Makes Ayola Pilau Different
- **Whole spices** (cumin seeds, cardamom pods, cinnamon sticks, cloves)
- **Premium basmati rice** for perfect grain separation
- **Natural seasonings only** — zero MSG

### Tips from Chef Prisca
1. Always toast your whole spices in hot oil first
2. Use basmati rice and wash it 3 times before cooking
3. The water-to-rice ratio is key: 1.5 cups water per 1 cup rice
4. Let it steam on low heat for the last 10 minutes — don''t lift the lid!',
   'cooking-demo', 'https://www.youtube.com/watch?v=0RmZ4vwpAME', 'youtube',
   '45 mins', '4-6 servings', 'Medium',
   ARRAY['2 cups basmati rice', '300g minced meat', '2 onions sliced', '3 tomatoes diced', 'Cumin seeds, cardamom, cinnamon, cloves', 'Garlic and ginger paste', 'Salt to taste', '3 cups water', 'Cooking oil'],
   ARRAY['pilau', 'rice', 'main course', 'signature'],
   'Prisca Kiragu', '2026-02-15', true, 'heritage-jollof', 1),

  ('synbiotic-porridge-benefits', 'Synbiotic Porridge — Why Your Gut Needs This',
   'Learn how our fermented synbiotic porridge combines probiotics and prebiotics to transform your digestive health.',
   '## What is Synbiotic Porridge?

**Synbiotic** means combining **probiotics** (beneficial live bacteria) with **prebiotics** (food for those bacteria). When you consume both together, the probiotics survive better and work harder in your gut.

### Health Benefits
- **Improved digestion** — probiotics break down food more efficiently
- **Stronger immunity** — 70% of your immune system is in your gut
- **Better nutrient absorption** — fermentation makes minerals more bioavailable
- **Reduced bloating** — balanced gut flora reduces gas and discomfort',
   'health-tip', 'https://www.instagram.com/reel/ayolafoods/', 'instagram',
   '24-48 hours (fermentation)', '6-8 servings', 'Easy',
   ARRAY['1 cup Ayola Special Uji Blend', '3 cups warm water', 'Natural fermentation starter', 'Honey to taste', 'Warm milk for serving'],
   ARRAY['porridge', 'gut health', 'probiotics', 'fermented', 'synbiotic'],
   'Prisca Kiragu', '2026-01-20', true, 'synbiotic-porridge', 2),

  ('plantain-probiotic-kvass', 'How We Make Plantain Probiotic Kvass',
   'A behind-the-scenes look at Kenya''s first plantain-based probiotic beverage — from raw plantain to fermented goodness.',
   '## Plantain Kvass: Innovation Meets Tradition

Kvass is a traditional fermented beverage. At Ayola Foods, we''ve reimagined it using **plantain** — a fruit rich in resistant starch, which acts as a powerful prebiotic.

### The Fermentation Process
1. **Select ripe plantains** — yellow with some black spots
2. **Peel and slice** into thin rounds
3. **Add to filtered water** with a small amount of honey
4. **Introduce fermentation cultures** — our proprietary Lactobacillus blend
5. **Ferment for 48-72 hours** at controlled room temperature
6. **Strain and bottle** — serve chilled',
   'beverage', 'https://www.instagram.com/reel/ayolafoods/', 'instagram',
   '48-72 hours', '8-10 servings', 'Advanced',
   ARRAY['4 ripe plantains', '1 liter filtered water', '2 tbsp raw honey', 'Fermentation cultures (Lactobacillus blend)', 'Glass jar with breathable cover'],
   ARRAY['kvass', 'plantain', 'probiotic', 'fermented', 'beverage'],
   'Prisca Kiragu', '2026-02-01', true, 'plantain-kvass', 3),

  ('ayola-ugali-bread-recipe', 'Healthier Bread Using Ayola Ugali Blend',
   'Our customers discovered that Ayola''s ugali blend makes incredible bread. Here''s how to do it at home.',
   '## Bread from Ugali Flour? Yes!

Our ugali blend makes fantastic bread. The indigenous grains add nutrition, fiber, and a subtle nutty flavor.

### Recipe: Ayola Blend Bread
**Ingredients:**
- 2 cups wheat flour
- 1 cup Ayola Special Ugali Blend
- 1 packet instant yeast (10g)
- 1 tsp salt, 1 tbsp sugar, 2 tbsp vegetable oil, 1.5 cups warm water

**Method:**
1. Mix dry ingredients, add oil and warm water, knead 10 minutes
2. Cover and let rise 1 hour (until doubled)
3. Shape into a loaf, let rise 30 more minutes
4. Bake at 180°C for 35-40 minutes until golden',
   'how-to', 'https://www.facebook.com/100087278121034/videos/', 'facebook',
   '2 hours', '1 loaf', 'Medium',
   ARRAY['2 cups wheat flour', '1 cup Ayola Special Ugali Blend', '1 packet instant yeast (10g)', '1 tsp salt', '1 tbsp sugar', '2 tbsp vegetable oil', '1.5 cups warm water'],
   ARRAY['bread', 'ugali blend', 'baking', 'healthy'],
   'Prisca Kiragu', '2026-03-01', false, 'finger-millet-flour', 4),

  ('goat-milk-chai-perfect', 'The Perfect Goat Milk Chai',
   'Why goat milk makes better chai — easier to digest, creamier texture, and richer flavor. Here''s our method.',
   '## Why Goat Milk Chai?

Goat milk is naturally homogenized, easier to digest, and richer in calcium and vitamins than cow milk.

### Our Recipe
1. Bring 2 cups water to a simmer
2. Add 2 tsp loose black tea and crushed ginger
3. Simmer for 3 minutes
4. Add 2 cups fresh goat milk and spices
5. Heat until just before boiling
6. Strain and add honey to taste',
   'beverage', 'https://www.tiktok.com/@priscakiragu', 'tiktok',
   '10 mins', '2 cups', 'Easy',
   ARRAY['2 cups fresh goat milk', '2 cups water', '2 tsp loose Kenyan black tea', '1 inch fresh ginger crushed', '3 cardamom pods crushed', '1 small cinnamon stick', 'Honey to taste'],
   ARRAY['chai', 'goat milk', 'tea', 'beverage', 'easy'],
   'Prisca Kiragu', '2026-02-20', false, 'goat-milk-tea', 5),

  ('rabbit-wet-fry-tutorial', 'How to Make Rabbit Wet Fry — The Ayola Way',
   'Rabbit is one of the healthiest meats available. Watch how we prepare our signature rabbit wet fry combo.',
   '## Rabbit: The Underrated Superfood Meat

Rabbit has the highest protein and lowest fat of any commonly available meat.

### Ayola''s Wet Fry Method
1. **Clean and portion** the rabbit into serving pieces
2. **Marinate** with garlic, ginger, salt, and lemon juice for 30 minutes
3. **Sear** in hot oil until golden on all sides
4. **Add aromatics** — onions, tomatoes, bell peppers
5. **Simmer in sauce** with a splash of water for 25-30 minutes until tender
6. **Finish** with fresh coriander and serve with Ayola Special Ugali',
   'cooking-demo', 'https://www.instagram.com/reel/ayolafoods/', 'instagram',
   '1 hour', '3-4 servings', 'Medium',
   ARRAY['1 whole rabbit portioned', '4 tomatoes diced', '2 onions sliced', '2 bell peppers sliced', '4 cloves garlic minced', '1 inch ginger grated', 'Fresh coriander', 'Salt, lemon juice', 'Cooking oil'],
   ARRAY['rabbit', 'wet fry', 'main course', 'high protein', 'low fat'],
   'Prisca Kiragu', '2026-03-10', true, 'rabbit-wet-fry', 6)

ON CONFLICT (slug) DO NOTHING;

-- ── Blog posts table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         text UNIQUE NOT NULL,
  title        text NOT NULL,
  excerpt      text,
  content      text,
  category     text NOT NULL DEFAULT 'health'
                 CHECK (category IN ('health','recipes','news','community','science')),
  cover_image  text,
  author       text DEFAULT 'Prisca Kiragu',
  author_image text,
  read_time    text,
  tags         text[],
  is_featured  boolean DEFAULT false,
  is_active    boolean DEFAULT true,
  published_at date,
  sort_order   integer DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active blog posts" ON public.blog_posts
  FOR SELECT USING (is_active = true);
GRANT SELECT ON public.blog_posts TO anon, authenticated;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Seed blog posts
INSERT INTO public.blog_posts (slug, title, excerpt, content, category, cover_image, author, read_time, tags, is_featured, published_at, sort_order)
VALUES
  ('perfect-finger-millet-porridge', 'How to Make the Perfect Finger Millet Porridge',
   'Finger millet (wimbi) is one of Kenya''s most nutritious grains. Here''s how to prepare it the Ayola way for maximum gut health benefits.',
   '## The Ancient Grain Making a Comeback

Finger millet has been grown in East Africa for over 5,000 years. Our grandmothers knew what modern science is now confirming — it''s one of the most nutritious grains on earth.

### Why Finger Millet?
- **10x more calcium than wheat** — critical for bone health
- **Rich in iron** — fights anaemia naturally
- **Naturally gluten-free** — suitable for most dietary needs
- **Low glycemic index** — sustained energy without blood sugar spikes

### The Ayola Method
1. Soak 1 cup of Ayola Uji Blend in 2 cups warm water for 8-12 hours
2. Ferment at room temperature — this activates the probiotics
3. Cook over medium heat, stirring constantly, for 10-15 minutes
4. Sweeten with honey and serve with warm goat milk

The fermentation step is what makes Ayola porridge a synbiotic food — it creates both probiotics and prebiotics simultaneously.',
   'health', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80&auto=format&fit=crop',
   'Prisca Kiragu', '5 min read', ARRAY['finger millet', 'porridge', 'gut health', 'fermentation', 'nutrition'],
   true, '2026-03-15', 1),

  ('why-indigenous-grains-matter', 'Why Indigenous Grains Are the Future of Kenyan Nutrition',
   'Sorghum, finger millet, and amaranth were staple foods for generations. Modern Kenyans are rediscovering their incredible nutritional value — and Ayola is leading the way.',
   '## The Nutritional Revolution Hiding in Plain Sight

For decades, Kenya''s food system shifted toward refined maize flour, white rice, and processed foods. The result? Rising rates of diabetes, obesity, and nutritional deficiencies.

But our indigenous grains never went away. They were just forgotten.

### Sorghum: The Drought-Resistant Superfood
Sorghum is naturally gluten-free, rich in antioxidants, and has a lower glycemic index than maize. It''s also drought-resistant — making it a climate-smart crop for Kenyan farmers.

### Amaranth: The Complete Protein
Amaranth is one of the few plant foods that contains all essential amino acids. It''s also rich in iron, calcium, and magnesium.

### Finger Millet: The Calcium Champion
Gram for gram, finger millet contains more calcium than milk. For communities where dairy is expensive or unavailable, it''s a critical nutritional resource.

### Ayola''s Mission
We source all our grains directly from smallholder farmers in the Rift Valley, paying above-market rates and investing in regenerative farming practices.',
   'science', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80&auto=format&fit=crop',
   'Prisca Kiragu', '7 min read', ARRAY['indigenous grains', 'sorghum', 'amaranth', 'finger millet', 'nutrition', 'Kenya'],
   true, '2026-02-28', 2),

  ('ayola-foods-expands-to-mombasa', 'Ayola Foods Now Delivers to Mombasa',
   'We''re excited to announce that our packaged products now ship to Mombasa and the Coast region. Heritage nutrition, delivered to your door.',
   '## Nairobi to the Coast

Since launching our countrywide shipping service, the most requested destination has been Mombasa. Today, we''re thrilled to confirm that all our packaged products — flour blends, uji blends, and custom formulations — now ship reliably to Mombasa and the wider Coast region.

### What''s Available for Mombasa Delivery
- Ayola Special Ugali Blend (1kg, 2kg, 5kg)
- Ayola Special Uji Blend (500g, 1kg)
- Finger Millet Flour (1kg)
- Sorghum Flour Blend (1kg)
- Custom Flour Blends (minimum 5kg)

### Delivery Times
Standard delivery to Mombasa takes 2-3 business days via our courier partner. Orders placed before 12pm are dispatched same day.

### Pricing
Delivery fee to Mombasa: KES 350 (free on orders over KES 5,000).',
   'news', 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&q=80&auto=format&fit=crop',
   'Ayola Foods Team', '3 min read', ARRAY['delivery', 'mombasa', 'shipping', 'news'],
   false, '2026-03-01', 3),

  ('gut-brain-connection-explained', 'The Gut-Brain Connection: Why Your Stomach Affects Your Mood',
   'Science is revealing a powerful link between gut health and mental wellbeing. Here''s what it means for what you eat.',
   '## Your Second Brain

Did you know your gut has its own nervous system? The enteric nervous system contains over 100 million nerve cells — more than the spinal cord. Scientists now call it the "second brain."

### The Gut-Brain Axis
The gut and brain communicate constantly through the vagus nerve, hormones, and the immune system. When your gut microbiome is healthy, this communication supports:
- **Better mood** — 90% of serotonin is produced in the gut
- **Reduced anxiety** — beneficial bacteria produce GABA, a calming neurotransmitter
- **Sharper focus** — gut inflammation can cause brain fog
- **Better sleep** — gut bacteria influence melatonin production

### What This Means for Your Diet
Fermented foods like our Synbiotic Porridge and Plantain Kvass directly feed the beneficial bacteria that support this gut-brain communication. It''s not just about digestion — it''s about your whole wellbeing.',
   'science', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format&fit=crop',
   'Prisca Kiragu', '6 min read', ARRAY['gut health', 'brain', 'mental health', 'probiotics', 'science'],
   true, '2026-02-10', 4),

  ('rabbit-farming-kenya', 'Why Rabbit Farming is the Future of Sustainable Protein in Kenya',
   'Rabbit meat is the leanest, most sustainable protein available. Ayola is working with local farmers to make it mainstream.',
   '## The Case for Rabbit

Kenya imports millions of dollars of beef and chicken annually. Yet one of the most nutritious, sustainable, and locally producible proteins is largely ignored: rabbit.

### The Numbers
- Rabbit produces 1kg of meat per 3kg of feed (vs 7kg for beef)
- Rabbit meat has 29g protein per 100g — higher than chicken or beef
- Rabbit fat content is just 3.5g per 100g — the lowest of any common meat
- Rabbits can be raised in small spaces, making them ideal for urban and peri-urban farming

### Ayola''s Rabbit Program
We source our rabbits from a network of 12 small-scale rabbit farmers in Kiambu and Murang''a counties. We pay premium prices and provide technical support to help farmers scale their operations.

### Try It
Our Rabbit Wet Fry Combo is available daily at our Kahawa Sukari restaurant. Order online for Nairobi delivery.',
   'community', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80&auto=format&fit=crop',
   'Prisca Kiragu', '5 min read', ARRAY['rabbit', 'sustainable', 'protein', 'farming', 'Kenya'],
   false, '2026-01-25', 5),

  ('fermentation-guide-beginners', 'A Beginner''s Guide to Fermentation at Home',
   'Fermentation is one of the oldest food preservation techniques in the world. Here''s how to get started at home with simple Kenyan ingredients.',
   '## Why Ferment?

Fermentation transforms ordinary food into probiotic powerhouses. It''s how our grandmothers preserved food before refrigerators — and it turns out, it was making the food healthier in the process.

### Simple Ferments to Start With

**1. Fermented Uji (Porridge)**
- Mix 1 cup Ayola Uji Blend with 2 cups warm water
- Cover loosely and leave at room temperature for 24-48 hours
- Cook as normal — the fermentation adds probiotics and improves nutrient absorption

**2. Fermented Vegetables (Kenyan Kimchi)**
- Chop kale, cabbage, or sukuma wiki
- Mix with salt (2% of vegetable weight)
- Pack tightly into a jar, press down until liquid covers vegetables
- Leave at room temperature for 3-7 days

**3. Fermented Milk (Mursik)**
- Traditional Kalenjin fermented milk
- Use a clean gourd or glass jar
- Add fresh milk and a small amount of previous batch as starter
- Leave for 24-48 hours until pleasantly sour',
   'recipes', 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80&auto=format&fit=crop',
   'Prisca Kiragu', '8 min read', ARRAY['fermentation', 'probiotics', 'home cooking', 'guide', 'beginners'],
   false, '2026-01-15', 6)

ON CONFLICT (slug) DO NOTHING;

-- ── Team members table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  role       text NOT NULL,
  bio        text,
  image_url  text,
  initials   text,
  is_active  boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active team" ON public.team_members
  FOR SELECT USING (is_active = true);
GRANT SELECT ON public.team_members TO anon, authenticated;

INSERT INTO public.team_members (name, role, bio, image_url, initials, sort_order)
VALUES
  ('Prisca Kiragu', 'Founder & Food Scientist',
   'BSc Food Science & Technology (JKUAT). Specialist in fermentation, gut health, and indigenous grain value addition. Formulates every Ayola product personally.',
   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop&crop=face',
   'PK', 1),
  ('James Mwangi', 'Head of Sourcing',
   '15 years working with smallholder farmers across the Rift Valley. Manages our network of 42 partner farms and ensures every ingredient meets our regenerative standards.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop&crop=face',
   'JM', 2),
  ('Amina Odhiambo', 'Head of Operations',
   'Former supply chain lead at a Nairobi FMCG company. Manages daily kitchen operations, quality control, and countrywide delivery logistics.',
   'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop&crop=face',
   'AO', 3)
ON CONFLICT DO NOTHING;

-- ── Milestones table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.milestones (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  year       text NOT NULL,
  title      text NOT NULL,
  body       text,
  is_active  boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read milestones" ON public.milestones
  FOR SELECT USING (is_active = true);
GRANT SELECT ON public.milestones TO anon, authenticated;

INSERT INTO public.milestones (year, title, body, sort_order)
VALUES
  ('2018', 'The First Pot', 'What started as a weekend supper club in a Nairobi apartment became the seed of something bigger — a mission to bring heritage African nutrition back to modern tables.', 1),
  ('2020', 'Roots in the Rift Valley', 'We partnered with 12 smallholder farms across the Rift Valley, growing heirloom peppers, sorghum, finger millet, and hibiscus using regenerative practices.', 2),
  ('2022', 'Packaged for Kenya', 'Our heritage flour blends launched as packaged products, shipping to all 47 counties. For the first time, families across Kenya could access ancestral nutrition at home.', 3),
  ('2024', 'Science Meets Tradition', 'We introduced Kenya''s first plantain probiotic kvass and synbiotic porridge — formulated by a food scientist, rooted in centuries of African fermentation wisdom.', 4)
ON CONFLICT DO NOTHING;

-- ── Update store_settings with complete social/contact data ──
UPDATE public.store_settings SET
  support_phone        = '0713 280 550',
  support_email        = 'ayola.foods.kenya@gmail.com',
  whatsapp_number      = '254713280550',
  address              = 'Ruhan Plaza, Ground Floor Room 23, Kahawa Sukari',
  city                 = 'Nairobi',
  country              = 'Kenya',
  tagline              = 'Eat Healthy, Enjoy Life',
  facebook_url         = 'https://www.facebook.com/p/Ayola-Foods-Kenya-100087278121034/',
  instagram_url        = 'https://www.instagram.com/ayolafoods/',
  instagram_handle     = '@ayolafoods',
  tiktok_url           = 'https://www.tiktok.com/@priscakiragu',
  tiktok_handle        = '@priscakiragu',
  youtube_url          = 'https://www.youtube.com/watch?v=0RmZ4vwpAME',
  opening_hours        = '[
    {"day": "Monday - Friday", "hours": "7:00 AM - 8:00 PM", "is_open": true},
    {"day": "Saturday",        "hours": "7:00 AM - 8:00 PM", "is_open": true},
    {"day": "Sunday",          "hours": "8:00 AM - 6:00 PM",  "is_open": true}
  ]'::jsonb,
  stats                = '[
    {"value": "42",    "label": "Partner Farms"},
    {"value": "6+",    "label": "Years Crafting"},
    {"value": "47",    "label": "Counties Reached"},
    {"value": "100%",  "label": "Natural Ingredients"},
    {"value": "2,400+","label": "Community Members"},
    {"value": "4.9★",  "label": "Average Rating"}
  ]'::jsonb
WHERE id = 1;

-- ── RLS grants for new tables ─────────────────────────────
GRANT SELECT ON public.recipes      TO anon, authenticated;
GRANT SELECT ON public.blog_posts   TO anon, authenticated;
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT SELECT ON public.milestones   TO anon, authenticated;
