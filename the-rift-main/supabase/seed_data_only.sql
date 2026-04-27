-- ============================================================
-- Rift & Root — Data Only Seed
-- Run this AFTER:
--   1. Migrations are already applied (tables exist)
--   2. Admin user created via Dashboard → Authentication → Users
--   3. Admin role set with:
--      UPDATE public.profiles SET role = 'admin', full_name = 'Prisca Kiragu'
--      WHERE email = 'admin@riftandroot.com';
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO public.categories (id, slug, name, tagline, icon, description, color, bg_color, ships_countrywide, price_from, sort_order)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'meals',     'Meals',     'Healthy, unconventional, delicious', '🍽️', 'Nutritious meal combos featuring unconventional proteins, heritage ugali, and gut-friendly sides.',                                             'from-amber-500 to-orange-600',  'bg-amber-50',  false, 1200, 1),
  ('10000000-0000-0000-0000-000000000002', 'beverages', 'Beverages', 'Gut health in every sip',            '🥤', 'Fermented drinks and probiotic beverages formulated by a food scientist for digestive health and immunity.',                                  'from-green-500 to-emerald-600', 'bg-green-50',  true,  400,  2),
  ('10000000-0000-0000-0000-000000000003', 'breakfast', 'Breakfast', 'Start your day right',               '🍳', 'Healthy breakfast combos and light meal options to fuel your morning the Rift & Root way.',                                                   'from-yellow-500 to-amber-500',  'bg-yellow-50', false, 850,  3),
  ('10000000-0000-0000-0000-000000000004', 'packaged',  'Packaged',  'Heritage nutrition, delivered',      '🌾', 'Our signature flour blends and pantry staples — heritage grains, no preservatives, ships countrywide.',                                      'from-orange-500 to-red-500',    'bg-orange-50', true,  250,  4)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PRODUCTS
-- ============================================================
INSERT INTO public.products (id, legacy_id, slug, name, category_id, description, long_description, price, size, image_url, features, ingredients, nutrition_highlights, badge, in_stock, is_active, sort_order)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'heritage-jollof',   'heritage-jollof',   'Heritage Jollof',
   '10000000-0000-0000-0000-000000000001',
   'Smoky, slow-cooked rice infused with sun-ripened highland peppers, native bay and a whisper of locust bean.',
   'Our Heritage Jollof is a celebration of West African culinary tradition — slow-cooked rice infused with sun-ripened highland peppers, native bay leaf, and a whisper of locust bean.',
   1200, 'Full serving',
   'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80&auto=format&fit=crop',
   ARRAY['Vegan','Slow-Cooked','Signature Spice Blend'],
   'Basmati rice, highland peppers, native bay leaf, locust bean, natural spices',
   ARRAY['Plant-based','No MSG','Rich in antioxidants'],
   'Vegan', true, true, 1),

  ('20000000-0000-0000-0000-000000000002', 'savanna-maafe',     'savanna-maafe',     'Savanna Maafe',
   '10000000-0000-0000-0000-000000000001',
   'A velvety extraction of stone-ground peanuts, sweet potato, baobab and savanna spices.',
   'Savanna Maafe is a rich, velvety peanut stew rooted in West African tradition.',
   1450, 'Full serving',
   'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80&auto=format&fit=crop',
   ARRAY['Gluten-Free','High Protein','Heritage Recipe'],
   'Stone-ground peanuts, sweet potato, baobab, savanna spice blend, vegetables',
   ARRAY['High protein','Gluten-free','Rich in healthy fats'],
   'Gluten-Free', true, true, 2),

  ('20000000-0000-0000-0000-000000000003', 'royal-egusi',       'royal-egusi',       'Royal Egusi',
   '10000000-0000-0000-0000-000000000001',
   'Toasted egusi seeds folded into wild spinach and a slow-simmered palm-fruit broth.',
   'Royal Egusi is a West African classic elevated to its finest form.',
   1800, 'Full serving',
   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop',
   ARRAY['Protein-Rich','Iron-Rich','Traditional Recipe'],
   'Egusi (melon seeds), wild spinach, palm-fruit broth, traditional spices',
   ARRAY['High protein','Iron-rich','Rich in vitamins A & C'],
   'Protein-Rich', true, true, 3),

  ('20000000-0000-0000-0000-000000000004', 'pounded-yam',       'pounded-yam',       'Pounded Yam & Ila',
   '10000000-0000-0000-0000-000000000001',
   'Smooth, hand-pounded yam paired with a fresh seafood okra broth fragrant with crayfish.',
   'Pounded Yam & Ila is a beloved West African comfort food.',
   1600, 'Full serving',
   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80&auto=format&fit=crop',
   ARRAY['Seafood','Hand-Pounded','Traditional'],
   'Yam, okra, seafood (crayfish, fish), traditional spices',
   ARRAY['High in potassium','Good source of fiber','Seafood protein'],
   NULL, true, true, 4),

  ('20000000-0000-0000-0000-000000000005', 'zobo-infusion',     'zobo-infusion',     'Zobo Infusion',
   '10000000-0000-0000-0000-000000000002',
   'Sun-dried hibiscus petals steeped with ginger, cloves and a thread of pineapple.',
   'Zobo Infusion is a vibrant, naturally refreshing beverage rich in antioxidants and vitamin C.',
   400, 'Per serving',
   'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80&auto=format&fit=crop',
   ARRAY['Natural','Antioxidant-Rich','No Added Sugar'],
   'Sun-dried hibiscus petals, ginger, cloves, pineapple, water',
   ARRAY['Rich in antioxidants','High in vitamin C','No artificial additives'],
   'Natural', true, true, 1),

  ('20000000-0000-0000-0000-000000000006', 'plantain-kvass',    'plantain-kvass',    'Plantain Probiotic Kvass',
   '10000000-0000-0000-0000-000000000002',
   'Kenya''s first plantain-based probiotic kvass — naturally fermented, gut-friendly, and refreshing.',
   'Made from ripe plantains rich in resistant starch, naturally fermented with Lactobacillus cultures.',
   500, 'Per 330ml bottle',
   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80&auto=format&fit=crop',
   ARRAY['Probiotic','Fermented','Gut Health'],
   'Ripe plantain, filtered water, raw honey, Lactobacillus cultures',
   ARRAY['Live probiotics','Prebiotic fiber','No preservatives'],
   'Probiotic', true, true, 2),

  ('20000000-0000-0000-0000-000000000007', 'golden-puffs',      'golden-puffs',      'Golden Puffs',
   '10000000-0000-0000-0000-000000000003',
   'Artisanal yeasted dough balls, fried until amber and finished with a warm ginger glaze.',
   'A beloved breakfast treat combining fresh-fried dough with the warmth of ginger.',
   850, 'Per serving (6 pcs)',
   'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80&auto=format&fit=crop',
   ARRAY['Artisanal','Fresh-Made','Ginger Glaze'],
   'Wheat flour, yeast, ginger, natural sweetener, cooking oil',
   ARRAY['Fresh ingredients','No preservatives','Artisanal quality'],
   NULL, true, true, 1),

  ('20000000-0000-0000-0000-000000000008', 'synbiotic-porridge','synbiotic-porridge','Synbiotic Porridge',
   '10000000-0000-0000-0000-000000000003',
   'Fermented heritage grain porridge combining probiotics and prebiotics for optimal gut health.',
   'Made from fermented finger millet and sorghum, delivering maximum gut health benefits.',
   350, 'Per serving',
   'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80&auto=format&fit=crop',
   ARRAY['Synbiotic','Fermented','Gut Health','Heritage Grains'],
   'Fermented finger millet, sorghum, amaranth, natural cultures',
   ARRAY['Live probiotics','Prebiotic fiber','Iron-rich','Calcium-rich'],
   'Gut Health', true, true, 2),

  ('20000000-0000-0000-0000-000000000009', 'ayola-ugali-blend', 'heritage-ugali-blend','Heritage Ugali Blend',
   '10000000-0000-0000-0000-000000000004',
   'Our signature ugali blend — maize fortified with finger millet, sorghum, and amaranth.',
   'Triples the iron content of regular ugali while adding calcium, fiber, and complete protein.',
   250, '1kg pack',
   'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80&auto=format&fit=crop',
   ARRAY['Ships Countrywide','Heritage Grains','Fortified','No Preservatives'],
   'Maize flour, finger millet, sorghum, amaranth',
   ARRAY['3x more iron than regular ugali','High calcium','Complete protein','No preservatives'],
   'Bestseller', true, true, 1),

  ('20000000-0000-0000-0000-000000000010', 'ayola-uji-blend',   'heritage-uji-blend','Heritage Uji Blend',
   '10000000-0000-0000-0000-000000000004',
   'A premium porridge blend of finger millet, sorghum, and amaranth — fortified with iron and vitamins.',
   'Precise ratios of finger millet, sorghum, and amaranth for maximum nutritional value.',
   600, '500g pack',
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop',
   ARRAY['Ships Countrywide','Iron Fortified','Vitamin Enriched','Gluten-Free'],
   'Finger millet, sorghum, amaranth, iron, vitamin A, vitamin D',
   ARRAY['High iron','Vitamin A & D fortified','Gluten-free','Suitable for all ages'],
   'Fortified', true, true, 2)

ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SAMPLE ORDERS (guest orders — no customer_id required)
-- ============================================================
INSERT INTO public.orders (id, order_number, customer_id, status, customer_name, customer_phone, customer_email, delivery_address, delivery_city, delivery_type, subtotal, delivery_fee, total, payment_method, payment_status, created_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'RR-2024-0001', NULL, 'delivered',  'Wanjiru Kamau',  '0712345678', 'wanjiru@example.com', 'Westlands, Nairobi',  'Nairobi', 'delivery', 2050, 0,   2050, 'mpesa',            'completed',  now() - interval '10 days'),
  ('30000000-0000-0000-0000-000000000002', 'RR-2024-0002', NULL, 'confirmed',  'Brian Odhiambo', '0723456789', 'brian@example.com',   'Kilimani, Nairobi',   'Nairobi', 'delivery', 1800, 200, 2000, 'cash_on_delivery', 'pending',    now() - interval '2 days'),
  ('30000000-0000-0000-0000-000000000003', 'RR-2024-0003', NULL, 'preparing',  'Amina Said',     '0734567890', 'amina@example.com',   'Nyali, Mombasa',      'Mombasa', 'shipping', 850,  300, 1150, 'mpesa',            'completed',  now() - interval '1 day'),
  ('30000000-0000-0000-0000-000000000004', 'RR-2024-0004', NULL, 'pending',    'David Mwangi',   '0745678901', NULL,                  'Thika Road, Nairobi', 'Nairobi', 'delivery', 1200, 200, 1400, 'mpesa',            'processing', now() - interval '3 hours'),
  ('30000000-0000-0000-0000-000000000005', 'RR-2024-0005', NULL, 'dispatched', 'Wanjiru Kamau',  '0712345678', 'wanjiru@example.com', 'Westlands, Nairobi',  'Nairobi', 'delivery', 2300, 0,   2300, 'mpesa',            'completed',  now() - interval '5 hours'),
  ('30000000-0000-0000-0000-000000000006', 'RR-2024-0006', NULL, 'delivered',  'Grace Njeri',    '0756789012', NULL,                  'Nakuru Town',         'Nakuru',  'shipping', 500,  300, 800,  'cash_on_delivery', 'pending',    now() - interval '15 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ORDER ITEMS
-- ============================================================
INSERT INTO public.order_items (id, order_id, product_id, product_name, product_price, quantity, line_total)
VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Heritage Jollof',         1200, 1, 1200),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000005', 'Zobo Infusion',            400, 1,  400),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 'Heritage Ugali Blend',     250, 1,  250),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'Royal Egusi',             1800, 1, 1800),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007', 'Golden Puffs',             850, 1,  850),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 'Heritage Jollof',         1200, 1, 1200),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 'Savanna Maafe',           1450, 1, 1450),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'Plantain Probiotic Kvass', 500, 1,  500),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000009', 'Heritage Ugali Blend',     250, 1,  250),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000010', 'Heritage Uji Blend',       500, 1,  500)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORE SETTINGS
-- ============================================================
INSERT INTO public.store_settings (id, store_name, support_email, support_phone, default_delivery_fee, delivery_cities, order_notification_emails)
VALUES (
  1,
  'Rift & Root Kenya',
  'admin@riftandroot.com',
  '0713280550',
  200,
  ARRAY['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika'],
  ARRAY['admin@riftandroot.com']
) ON CONFLICT (id) DO UPDATE SET
  store_name = 'Rift & Root Kenya',
  support_email = 'admin@riftandroot.com';

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO public.notifications (id, type, title, message, order_id, is_read, created_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', 'new_order',         'New Order #RR-2024-0004', 'New order placed by David Mwangi — KES 1,400',         '30000000-0000-0000-0000-000000000004', false, now() - interval '3 hours'),
  ('50000000-0000-0000-0000-000000000002', 'payment_completed', 'Payment Confirmed',       'M-Pesa payment confirmed for order #RR-2024-0005',     '30000000-0000-0000-0000-000000000005', false, now() - interval '5 hours'),
  ('50000000-0000-0000-0000-000000000003', 'new_order',         'New Order #RR-2024-0003', 'New order placed by Amina Said — KES 1,150 (Mombasa)', '30000000-0000-0000-0000-000000000003', true,  now() - interval '1 day'),
  ('50000000-0000-0000-0000-000000000004', 'payment_completed', 'Payment Confirmed',       'M-Pesa payment confirmed for order #RR-2024-0001',     '30000000-0000-0000-0000-000000000001', true,  now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE — run this after creating admin user in Dashboard:
--
-- UPDATE public.profiles
-- SET role = 'admin', full_name = 'Prisca Kiragu'
-- WHERE email = 'admin@riftandroot.com';
-- ============================================================
