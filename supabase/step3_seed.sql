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
  ('Free Delivery on Orders Over KES 2,000', 'Within Nairobi', NULL,
   'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1200&q=80&auto=format&fit=crop',
   'promo_strip', 1, true, '/shop', 'Order Now')
ON CONFLICT DO NOTHING;
