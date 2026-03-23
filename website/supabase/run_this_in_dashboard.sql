-- ============================================================
-- AYOLA FOODS KE: COMPLETE DATABASE SETUP
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click "Run" — everything happens in one go
-- ============================================================

-- ============================================
-- 1. CREATE ALL TABLES FIRST (no policies yet)
-- ============================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  icon text,
  description text,
  color text,
  bg_color text,
  ships_countrywide boolean DEFAULT false,
  price_from integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'kitchen')),
  default_address text,
  default_city text DEFAULT 'Nairobi',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  description text,
  long_description text,
  price integer NOT NULL,
  size text,
  image_url text,
  features text[] DEFAULT '{}',
  ingredients text,
  nutrition_highlights text[] DEFAULT '{}',
  badge text,
  in_stock boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled')),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text NOT NULL,
  delivery_city text NOT NULL DEFAULT 'Nairobi',
  delivery_type text NOT NULL DEFAULT 'delivery'
    CHECK (delivery_type IN ('delivery', 'pickup', 'shipping')),
  order_notes text,
  subtotal integer NOT NULL,
  delivery_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa', 'cash_on_delivery')),
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  mpesa_checkout_request_id text,
  mpesa_receipt_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  product_price integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  provider text NOT NULL,
  event_type text NOT NULL,
  raw_payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES (profiles exists now)
-- ============================================

-- Categories
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Products
DROP POLICY IF EXISTS "Anyone can read active products" ON public.products;
CREATE POLICY "Anyone can read active products"
  ON public.products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Orders
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'kitchen'))
  );

DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
  ON public.orders FOR INSERT WITH CHECK (true);

-- Order Items
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items"
  ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can read all order items" ON public.order_items;
CREATE POLICY "Admins can read all order items"
  ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'kitchen'))
  );

DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (true);

-- Payment Logs
DROP POLICY IF EXISTS "Admins can read payment logs" ON public.payment_logs;
CREATE POLICY "Admins can read payment logs"
  ON public.payment_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "Service can insert payment logs" ON public.payment_logs;
CREATE POLICY "Service can insert payment logs"
  ON public.payment_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ============================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.categories;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.products;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 7. SEED: CATEGORIES
-- ============================================

INSERT INTO public.categories (slug, name, tagline, icon, description, color, bg_color, ships_countrywide, price_from, sort_order) VALUES
('packaged', 'Packaged Flour Blends', 'Heritage nutrition, shipped countrywide', '🌾', 'Special ugali and uji flour blends — healthier alternatives to standard flour. Available for countrywide delivery.', 'from-orange-500 to-amber-600', 'bg-orange-50', true, 250, 1),
('meals', 'Ready Meals & Combos', 'Healthy, unconventional, delicious', '🍽️', 'Nutritious meal combos featuring unconventional proteins, heritage ugali, and gut-friendly sides. Dine in at Kahawa Sukari.', 'from-amber-500 to-orange-600', 'bg-amber-50', false, 500, 2),
('beverages', 'Probiotic Beverages', 'Gut health in every sip', '🥤', 'Fermented drinks and probiotic beverages formulated by a food scientist for digestive health and immunity.', 'from-green-500 to-emerald-600', 'bg-green-50', false, 120, 3),
('breakfast', 'Breakfast & Light Meals', 'Start your day right', '🍳', 'Healthy breakfast combos and light meal options to fuel your morning the Ayola way.', 'from-yellow-500 to-amber-500', 'bg-yellow-50', false, 400, 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 8. SEED: PRODUCTS
-- ============================================

INSERT INTO public.products (legacy_id, slug, name, category_id, description, long_description, price, size, image_url, features, ingredients, nutrition_highlights, badge, in_stock, sort_order) VALUES
('meal-001', 'pilau-spiced-up', 'Pilau — Spiced Up Edition',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'Our recently reintroduced pilau — richly spiced with Ayola''s signature blend. A customer favorite that''s back and better than ever.',
  'Ayola''s pilau has been reimagined with a bolder spice profile and premium ingredients. Slow-cooked with aromatic spices, served as a complete combo with your choice of protein.',
  600, 'Full combo', '/images/products/pilau-combo.jpg',
  ARRAY['Signature Spice Blend', 'Full Combo', 'Customer Favorite'],
  'Basmati rice, spice blend (cumin, cardamom, cinnamon, cloves), minced meat, vegetables, natural seasonings',
  ARRAY['High protein', 'No MSG', 'Natural spices', 'Balanced meal'],
  'Back & Better', true, 1),

('meal-002', 'rabbit-wet-fry', 'Rabbit Wet Fry Combo',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'Tender rabbit wet fry served with fresh greens and Ayola''s special ugali blend.',
  'Rabbit is one of the healthiest meats — high in protein, low in fat, rich in B-vitamins. Served with traditional greens and our proprietary ugali blend.',
  800, 'Full combo', '/images/products/rabbit-combo.jpg',
  ARRAY['High Protein', 'Low Fat Meat', 'With Special Ugali'],
  'Farm-raised rabbit, tomatoes, onions, garlic, ginger, bell peppers, traditional greens, Ayola special ugali',
  ARRAY['Lean protein (rabbit)', 'Low cholesterol', 'Iron-rich greens', 'Heritage ugali'],
  'Signature Dish', true, 2),

('meal-003', 'turkey-eggs-afkeido', 'Turkey Eggs + Toasted Bread + Afkeido Combo',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'An unconventional protein powerhouse — turkey eggs paired with toasted bread and our Afkeido mix.',
  'Turkey eggs are larger, richer, and more nutrient-dense than chicken eggs. Paired with artisan toasted bread and our signature Afkeido blend.',
  600, 'Full combo', '/images/products/turkey-eggs-combo.jpg',
  ARRAY['Turkey Eggs', 'Afkeido Blend', 'Unconventional'],
  'Turkey eggs, artisan bread, Afkeido blend, vegetables, natural seasonings',
  ARRAY['Higher protein than chicken eggs', 'Rich in B12', 'Selenium-rich', 'Unique combo'],
  'Unique', true, 3),

('meal-004', 'vegan-combo', 'Vegetarian / Vegan Combo',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'A hearty plant-based meal combo with heritage grains, fresh vegetables, and gut-friendly sides.',
  'Featuring heritage grains, legumes, fresh seasonal vegetables, and our special ugali or porridge.',
  500, 'Full combo', '/images/products/vegan-combo.jpg',
  ARRAY['Plant-Based', 'Gut-Friendly', 'Heritage Grains'],
  'Seasonal vegetables, heritage grains, legumes, Ayola special ugali, natural seasonings',
  ARRAY['Plant protein', 'High fiber', 'Rich in vitamins', 'Low cholesterol'],
  NULL, true, 4),

('bev-001', 'plantain-kvass', 'Plantain Probiotic Kvass',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Kenya''s first plantain-based probiotic beverage — fermented for gut health, immunity, and digestion.',
  'Our plantain probiotic kvass is naturally fermented to produce beneficial bacteria. Formulated by Prisca Kiragu (Food Scientist, JKUAT).',
  200, 'Per serving', '/images/products/plantain-kvass.jpg',
  ARRAY['Probiotic', 'Gut Health', 'First in Kenya'],
  'Plantain, filtered water, natural fermentation cultures, honey',
  ARRAY['Live probiotics', 'Prebiotic fiber', 'Supports immunity', 'Aids digestion'],
  'First in Kenya', true, 1),

('bev-002', 'synbiotic-porridge', 'Synbiotic Porridge',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Fermented porridge combining probiotics AND prebiotics — a synbiotic powerhouse for gut health.',
  'Carefully fermented using heritage grains for a drinkable porridge that actively improves digestive function.',
  150, 'Per serving', '/images/products/synbiotic-porridge.jpg',
  ARRAY['Synbiotic', 'Fermented', 'Digestive Wellness'],
  'Finger millet, sorghum, fermentation cultures (Lactobacillus), prebiotic fiber, natural sweetener',
  ARRAY['Probiotics + prebiotics', 'Improves digestion', 'Heritage grains', 'Immune support'],
  'Science-Backed', true, 2),

('bev-003', 'goat-milk-tea', 'Goat Milk Tea',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Fresh goat milk chai — easier to digest than cow''s milk, naturally rich in nutrients.',
  'Goat milk combined with premium Kenyan tea and warming spices for a chai that''s comforting and nutritious.',
  150, 'Per cup', '/images/products/goat-milk-tea.jpg',
  ARRAY['Easier to Digest', 'Fresh Goat Milk', 'Nutrient-Rich'],
  'Fresh goat milk, Kenyan black tea, ginger, cardamom, cinnamon, honey',
  ARRAY['High calcium', 'Easy digestion', 'Rich in potassium', 'Vitamin A & B2'],
  NULL, true, 3),

('bev-004', 'special-uji-drink', 'Special Uji (Porridge Drink)',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Ayola''s signature porridge drink — made from our special grain blend for sustained energy.',
  'A carefully formulated blend of indigenous grains for sustained energy, essential minerals, and great taste.',
  120, 'Per serving', '/images/products/special-uji.jpg',
  ARRAY['Heritage Grains', 'Sustained Energy', 'Great Taste'],
  'Ayola special uji blend (finger millet, sorghum, amaranth), milk, honey, cinnamon',
  ARRAY['High in iron', 'Sustained energy', 'B-vitamins', 'Multi-grain nutrition'],
  NULL, true, 4),

('pkg-001', 'ayola-ugali-blend', 'Ayola Special Ugali Blend',
  (SELECT id FROM public.categories WHERE slug = 'packaged'),
  'Our proprietary ugali flour blend — healthier than standard maize flour. Shipped countrywide.',
  'Combines traditional maize with nutrient-dense indigenous grains. Customers also use it for healthier bread.',
  250, 'Per pack', '/images/products/ugali-blend.jpg',
  ARRAY['Enhanced Nutrition', 'Ships Countrywide', 'Versatile'],
  'Proprietary blend of maize flour, indigenous grains, and natural fortification',
  ARRAY['More iron than standard ugali', 'Added fiber', 'Enhanced minerals', 'Smooth texture'],
  'Best Seller', true, 1),

('pkg-002', 'ayola-uji-blend', 'Ayola Special Uji Blend',
  (SELECT id FROM public.categories WHERE slug = 'packaged'),
  'Premium porridge flour blend — our signature uji mix for gut health, energy, and taste. Shipped countrywide.',
  'The same blend we use in our restaurant — food scientist-formulated heritage grains optimized for nutrition.',
  600, 'Per pack', '/images/products/uji-blend.jpg',
  ARRAY['Food Scientist Formulated', 'Ships Countrywide', 'Gut Health'],
  'Proprietary blend of finger millet, sorghum, amaranth, and natural fortification',
  ARRAY['High in iron & calcium', 'Heritage grains', 'Gut-friendly', 'Sustained energy'],
  'Premium', true, 2),

('pkg-003', 'custom-flour-blend', 'Custom Flour Blend',
  (SELECT id FROM public.categories WHERE slug = 'packaged'),
  'Custom-formulated flour blends for specific health needs.',
  'Our food scientist formulates custom blends tailored to your dietary needs. Contact us via WhatsApp.',
  0, 'Custom', '/images/products/custom-blend.jpg',
  ARRAY['Custom Formulation', 'Health-Specific', 'By a Food Scientist'],
  'Custom — varies based on client needs',
  ARRAY['Tailored nutrition', 'Specific health goals', 'Expert formulation', 'Flexible'],
  'Custom Order', true, 3),

('bfast-001', 'healthy-breakfast', 'Healthy Breakfast Combo',
  (SELECT id FROM public.categories WHERE slug = 'breakfast'),
  'Start your day the Ayola way — balanced breakfast with protein, whole grains, and fresh ingredients.',
  'Sustained energy throughout the morning. Featuring whole grains, quality protein, fresh vegetables, and our signature beverages.',
  400, 'Full breakfast', '/images/products/breakfast-combo.jpg',
  ARRAY['Balanced', 'Sustained Energy', 'Fresh Ingredients'],
  'Varies daily — eggs, whole grain bread, vegetables, Ayola beverage',
  ARRAY['Balanced macros', 'No refined sugar', 'Whole grains', 'Fresh & local'],
  NULL, true, 1),

('bfast-002', 'heavy-meal-combo', 'Heavy Meal Combo',
  (SELECT id FROM public.categories WHERE slug = 'breakfast'),
  'For those who need a serious meal — packs nutrition and flavor for the hungriest appetite.',
  'Generous portions of protein, special ugali or grain accompaniment, fresh vegetables, and a beverage.',
  800, 'Heavy combo', '/images/products/heavy-meal.jpg',
  ARRAY['Generous Portions', 'High Protein', 'Full Meal'],
  'Premium protein (varies), Ayola special ugali, vegetables, side, beverage',
  ARRAY['High protein', 'Balanced nutrition', 'Satisfying portions', 'Quality ingredients'],
  'Full Meal', true, 2)
ON CONFLICT (legacy_id) DO NOTHING;

-- ============================================
-- DONE! Tables: 6 | Categories: 4 | Products: 14
-- ============================================
