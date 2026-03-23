-- STEP 2: RLS policies + seed data (run this SECOND)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Categories policies
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Products policies
CREATE POLICY "Anyone can read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','kitchen'))
);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);

-- Order items policies
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins can read all order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','kitchen'))
);
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Payment logs policies
CREATE POLICY "Admins can read payment logs" ON public.payment_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Service can insert payment logs" ON public.payment_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- SEED: CATEGORIES
-- ============================================
INSERT INTO public.categories (slug, name, tagline, icon, description, color, bg_color, ships_countrywide, price_from, sort_order) VALUES
('packaged', 'Packaged Flour Blends', 'Heritage nutrition, shipped countrywide', '🌾', 'Special ugali and uji flour blends — healthier alternatives to standard flour.', 'from-orange-500 to-amber-600', 'bg-orange-50', true, 250, 1),
('meals', 'Ready Meals & Combos', 'Healthy, unconventional, delicious', '🍽️', 'Nutritious meal combos featuring unconventional proteins and heritage ugali.', 'from-amber-500 to-orange-600', 'bg-amber-50', false, 500, 2),
('beverages', 'Probiotic Beverages', 'Gut health in every sip', '🥤', 'Fermented drinks and probiotic beverages for digestive health and immunity.', 'from-green-500 to-emerald-600', 'bg-green-50', false, 120, 3),
('breakfast', 'Breakfast & Light Meals', 'Start your day right', '🍳', 'Healthy breakfast combos and light meal options.', 'from-yellow-500 to-amber-500', 'bg-yellow-50', false, 400, 4);

-- ============================================
-- SEED: PRODUCTS
-- ============================================
INSERT INTO public.products (legacy_id, slug, name, category_id, description, price, size, features, ingredients, nutrition_highlights, badge, in_stock, sort_order) VALUES
('meal-001', 'pilau-spiced-up', 'Pilau — Spiced Up Edition', (SELECT id FROM public.categories WHERE slug='meals'), 'Richly spiced pilau with Ayola signature blend.', 600, 'Full combo', ARRAY['Signature Spice Blend','Full Combo','Customer Favorite'], 'Basmati rice, spice blend, minced meat, vegetables', ARRAY['High protein','No MSG','Natural spices','Balanced meal'], 'Back & Better', true, 1),
('meal-002', 'rabbit-wet-fry', 'Rabbit Wet Fry Combo', (SELECT id FROM public.categories WHERE slug='meals'), 'Tender rabbit wet fry with fresh greens and special ugali.', 800, 'Full combo', ARRAY['High Protein','Low Fat Meat','With Special Ugali'], 'Farm-raised rabbit, tomatoes, onions, garlic, greens, Ayola ugali', ARRAY['Lean protein','Low cholesterol','Iron-rich greens','Heritage ugali'], 'Signature Dish', true, 2),
('meal-003', 'turkey-eggs-afkeido', 'Turkey Eggs + Toasted Bread + Afkeido', (SELECT id FROM public.categories WHERE slug='meals'), 'Turkey eggs with toasted bread and Afkeido mix.', 600, 'Full combo', ARRAY['Turkey Eggs','Afkeido Blend','Unconventional'], 'Turkey eggs, artisan bread, Afkeido blend, vegetables', ARRAY['Higher protein than chicken eggs','Rich in B12','Selenium-rich','Unique combo'], 'Unique', true, 3),
('meal-004', 'vegan-combo', 'Vegetarian / Vegan Combo', (SELECT id FROM public.categories WHERE slug='meals'), 'Plant-based meal with heritage grains and gut-friendly sides.', 500, 'Full combo', ARRAY['Plant-Based','Gut-Friendly','Heritage Grains'], 'Seasonal vegetables, heritage grains, legumes, Ayola ugali', ARRAY['Plant protein','High fiber','Rich in vitamins','Low cholesterol'], NULL, true, 4),
('bev-001', 'plantain-kvass', 'Plantain Probiotic Kvass', (SELECT id FROM public.categories WHERE slug='beverages'), 'Kenya first plantain-based probiotic beverage.', 200, 'Per serving', ARRAY['Probiotic','Gut Health','First in Kenya'], 'Plantain, filtered water, fermentation cultures, honey', ARRAY['Live probiotics','Prebiotic fiber','Supports immunity','Aids digestion'], 'First in Kenya', true, 1),
('bev-002', 'synbiotic-porridge', 'Synbiotic Porridge', (SELECT id FROM public.categories WHERE slug='beverages'), 'Fermented porridge combining probiotics and prebiotics.', 150, 'Per serving', ARRAY['Synbiotic','Fermented','Digestive Wellness'], 'Finger millet, sorghum, Lactobacillus cultures, prebiotic fiber', ARRAY['Probiotics + prebiotics','Improves digestion','Heritage grains','Immune support'], 'Science-Backed', true, 2),
('bev-003', 'goat-milk-tea', 'Goat Milk Tea', (SELECT id FROM public.categories WHERE slug='beverages'), 'Fresh goat milk chai — easier to digest, nutrient-rich.', 150, 'Per cup', ARRAY['Easier to Digest','Fresh Goat Milk','Nutrient-Rich'], 'Fresh goat milk, Kenyan black tea, ginger, cardamom, honey', ARRAY['High calcium','Easy digestion','Rich in potassium','Vitamin A & B2'], NULL, true, 3),
('bev-004', 'special-uji-drink', 'Special Uji (Porridge Drink)', (SELECT id FROM public.categories WHERE slug='beverages'), 'Signature porridge drink from our special grain blend.', 120, 'Per serving', ARRAY['Heritage Grains','Sustained Energy','Great Taste'], 'Finger millet, sorghum, amaranth, milk, honey, cinnamon', ARRAY['High in iron','Sustained energy','B-vitamins','Multi-grain nutrition'], NULL, true, 4),
('pkg-001', 'ayola-ugali-blend', 'Ayola Special Ugali Blend', (SELECT id FROM public.categories WHERE slug='packaged'), 'Healthier ugali flour blend. Ships countrywide.', 250, 'Per pack', ARRAY['Enhanced Nutrition','Ships Countrywide','Versatile'], 'Proprietary blend of maize flour and indigenous grains', ARRAY['More iron than standard ugali','Added fiber','Enhanced minerals','Smooth texture'], 'Best Seller', true, 1),
('pkg-002', 'ayola-uji-blend', 'Ayola Special Uji Blend', (SELECT id FROM public.categories WHERE slug='packaged'), 'Premium porridge flour for gut health and energy. Ships countrywide.', 600, 'Per pack', ARRAY['Food Scientist Formulated','Ships Countrywide','Gut Health'], 'Finger millet, sorghum, amaranth, natural fortification', ARRAY['High in iron & calcium','Heritage grains','Gut-friendly','Sustained energy'], 'Premium', true, 2),
('pkg-003', 'custom-flour-blend', 'Custom Flour Blend', (SELECT id FROM public.categories WHERE slug='packaged'), 'Custom flour blends for specific health needs.', 0, 'Custom', ARRAY['Custom Formulation','Health-Specific','By a Food Scientist'], 'Custom — varies based on client needs', ARRAY['Tailored nutrition','Specific health goals','Expert formulation','Flexible'], 'Custom Order', true, 3),
('bfast-001', 'healthy-breakfast', 'Healthy Breakfast Combo', (SELECT id FROM public.categories WHERE slug='breakfast'), 'Balanced breakfast with protein, whole grains, fresh ingredients.', 400, 'Full breakfast', ARRAY['Balanced','Sustained Energy','Fresh Ingredients'], 'Eggs, whole grain bread, vegetables, Ayola beverage', ARRAY['Balanced macros','No refined sugar','Whole grains','Fresh & local'], NULL, true, 1),
('bfast-002', 'heavy-meal-combo', 'Heavy Meal Combo', (SELECT id FROM public.categories WHERE slug='breakfast'), 'Serious meal — nutrition and flavor for the hungriest appetite.', 800, 'Heavy combo', ARRAY['Generous Portions','High Protein','Full Meal'], 'Premium protein, Ayola special ugali, vegetables, side, beverage', ARRAY['High protein','Balanced nutrition','Satisfying portions','Quality ingredients'], 'Full Meal', true, 2);
