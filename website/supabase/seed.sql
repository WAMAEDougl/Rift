-- Ayola Foods KE: Seed Data
-- Inserts current 4 categories + 14 products from products.ts

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO public.categories (slug, name, tagline, icon, description, color, bg_color, ships_countrywide, price_from, sort_order) VALUES
('packaged', 'Packaged Flour Blends', 'Heritage nutrition, shipped countrywide', '🌾', 'Special ugali and uji flour blends — healthier alternatives to standard flour. Available for countrywide delivery.', 'from-orange-500 to-amber-600', 'bg-orange-50', true, 250, 1),
('meals', 'Ready Meals & Combos', 'Healthy, unconventional, delicious', '🍽️', 'Nutritious meal combos featuring unconventional proteins, heritage ugali, and gut-friendly sides. Dine in at Kahawa Sukari.', 'from-amber-500 to-orange-600', 'bg-amber-50', false, 500, 2),
('beverages', 'Probiotic Beverages', 'Gut health in every sip', '🥤', 'Fermented drinks and probiotic beverages formulated by a food scientist for digestive health and immunity.', 'from-green-500 to-emerald-600', 'bg-green-50', false, 120, 3),
('breakfast', 'Breakfast & Light Meals', 'Start your day right', '🍳', 'Healthy breakfast combos and light meal options to fuel your morning the Ayola way.', 'from-yellow-500 to-amber-500', 'bg-yellow-50', false, 400, 4);

-- ============================================
-- PRODUCTS
-- ============================================

-- Ready Meals
INSERT INTO public.products (legacy_id, slug, name, category_id, description, long_description, price, size, image_url, features, ingredients, nutrition_highlights, badge, in_stock, sort_order) VALUES
('meal-001', 'pilau-spiced-up', 'Pilau — Spiced Up Edition',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'Our recently reintroduced pilau — richly spiced with Ayola''s signature blend. A customer favorite that''s back and better than ever.',
  'Ayola''s pilau has been reimagined with a bolder spice profile and premium ingredients. Slow-cooked with aromatic spices, served as a complete combo with your choice of protein. This is pilau the healthy way — all the flavor, better nutrition.',
  600, 'Full combo', '/images/products/pilau-combo.jpg',
  ARRAY['Signature Spice Blend', 'Full Combo', 'Customer Favorite'],
  'Basmati rice, spice blend (cumin, cardamom, cinnamon, cloves), minced meat, vegetables, natural seasonings',
  ARRAY['High protein', 'No MSG', 'Natural spices', 'Balanced meal'],
  'Back & Better', true, 1),

('meal-002', 'rabbit-wet-fry', 'Rabbit Wet Fry Combo',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'Tender rabbit wet fry served with fresh greens and Ayola''s special ugali blend. Unconventional protein, exceptional nutrition.',
  'Rabbit is one of the healthiest meats available — high in protein, low in fat, and rich in B-vitamins. Our wet fry preparation brings out incredible flavor, served with traditional greens and our proprietary ugali blend for a meal that''s as nutritious as it is delicious.',
  800, 'Full combo', '/images/products/rabbit-combo.jpg',
  ARRAY['High Protein', 'Low Fat Meat', 'With Special Ugali'],
  'Farm-raised rabbit, tomatoes, onions, garlic, ginger, bell peppers, traditional greens, Ayola special ugali',
  ARRAY['Lean protein (rabbit)', 'Low cholesterol', 'Iron-rich greens', 'Heritage ugali'],
  'Signature Dish', true, 2),

('meal-003', 'turkey-eggs-afkeido', 'Turkey Eggs + Toasted Bread + Afkeido Combo',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'An unconventional protein powerhouse — turkey eggs paired with toasted bread and our Afkeido mix. Nutrition you won''t find anywhere else.',
  'Turkey eggs are larger, richer, and more nutrient-dense than chicken eggs — packed with protein, B12, and selenium. Paired with artisan toasted bread and our signature Afkeido blend, this combo delivers serious nutrition with bold, satisfying flavors.',
  600, 'Full combo', '/images/products/turkey-eggs-combo.jpg',
  ARRAY['Turkey Eggs', 'Afkeido Blend', 'Unconventional'],
  'Turkey eggs, artisan bread, Afkeido blend, vegetables, natural seasonings',
  ARRAY['Higher protein than chicken eggs', 'Rich in B12', 'Selenium-rich', 'Unique combo'],
  'Unique', true, 3),

('meal-004', 'vegan-combo', 'Vegetarian / Vegan Combo',
  (SELECT id FROM public.categories WHERE slug = 'meals'),
  'A hearty plant-based meal combo with heritage grains, fresh vegetables, and gut-friendly sides. Proof that healthy can be delicious.',
  'Our vegetarian and vegan options are crafted to be satisfying and nutrient-complete — not an afterthought. Featuring heritage grains, legumes, fresh seasonal vegetables, and our special ugali or porridge, these combos are perfect for plant-based eaters and anyone wanting a lighter, healthier meal.',
  500, 'Full combo', '/images/products/vegan-combo.jpg',
  ARRAY['Plant-Based', 'Gut-Friendly', 'Heritage Grains'],
  'Seasonal vegetables, heritage grains, legumes, Ayola special ugali, natural seasonings',
  ARRAY['Plant protein', 'High fiber', 'Rich in vitamins', 'Low cholesterol'],
  NULL, true, 4),

-- Beverages
('bev-001', 'plantain-kvass', 'Plantain Probiotic Kvass',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Kenya''s first plantain-based probiotic beverage — fermented for gut health, immunity, and digestion. Formulated by a food scientist.',
  'Kvass is a traditional fermented beverage, and Ayola has innovated it using plantain — rich in resistant starch (a powerful prebiotic). Our plantain probiotic kvass is naturally fermented to produce beneficial bacteria that support gut health, improve digestion, and boost immunity. Formulated by founder Prisca Kiragu (Food Scientist, JKUAT) using evidence-based fermentation science.',
  200, 'Per serving', '/images/products/plantain-kvass.jpg',
  ARRAY['Probiotic', 'Gut Health', 'First in Kenya'],
  'Plantain, filtered water, natural fermentation cultures, honey',
  ARRAY['Live probiotics', 'Prebiotic fiber', 'Supports immunity', 'Aids digestion'],
  'First in Kenya', true, 1),

('bev-002', 'synbiotic-porridge', 'Synbiotic Porridge',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Fermented porridge combining probiotics AND prebiotics — a synbiotic powerhouse for gut health and digestive wellness.',
  'Synbiotics combine probiotics (beneficial bacteria) with prebiotics (food for those bacteria) for maximum gut health impact. Our synbiotic porridge is carefully fermented using heritage grains to create a delicious, drinkable porridge that actively improves your digestive function. This is food as medicine — backed by food science.',
  150, 'Per serving', '/images/products/synbiotic-porridge.jpg',
  ARRAY['Synbiotic', 'Fermented', 'Digestive Wellness'],
  'Finger millet, sorghum, fermentation cultures (Lactobacillus), prebiotic fiber, natural sweetener',
  ARRAY['Probiotics + prebiotics', 'Improves digestion', 'Heritage grains', 'Immune support'],
  'Science-Backed', true, 2),

('bev-003', 'goat-milk-tea', 'Goat Milk Tea',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Fresh goat milk chai — easier to digest than cow''s milk, naturally rich in nutrients, and absolutely delicious.',
  'Goat milk is naturally homogenized (smaller fat globules) making it easier to digest than cow''s milk. It''s rich in calcium, potassium, and vitamins A and B2. Our goat milk tea combines fresh goat milk with premium Kenyan tea and warming spices for a chai experience that''s both comforting and nutritious.',
  150, 'Per cup', '/images/products/goat-milk-tea.jpg',
  ARRAY['Easier to Digest', 'Fresh Goat Milk', 'Nutrient-Rich'],
  'Fresh goat milk, Kenyan black tea, ginger, cardamom, cinnamon, honey',
  ARRAY['High calcium', 'Easy digestion', 'Rich in potassium', 'Vitamin A & B2'],
  NULL, true, 3),

('bev-004', 'special-uji-drink', 'Special Uji (Porridge Drink)',
  (SELECT id FROM public.categories WHERE slug = 'beverages'),
  'Ayola''s signature porridge drink — made from our special grain blend for sustained energy and great taste.',
  'Our special uji is more than just porridge — it''s a carefully formulated blend of indigenous grains that provides sustained energy, essential minerals, and great taste. Perfect as a morning drink or an afternoon pick-me-up. Made from the same blend we sell as our packaged uji flour.',
  120, 'Per serving', '/images/products/special-uji.jpg',
  ARRAY['Heritage Grains', 'Sustained Energy', 'Great Taste'],
  'Ayola special uji blend (finger millet, sorghum, amaranth), milk, honey, cinnamon',
  ARRAY['High in iron', 'Sustained energy', 'B-vitamins', 'Multi-grain nutrition'],
  NULL, true, 4),

-- Packaged Products
('pkg-001', 'ayola-ugali-blend', 'Ayola Special Ugali Blend',
  (SELECT id FROM public.categories WHERE slug = 'packaged'),
  'Our proprietary ugali flour blend — healthier than standard maize flour, with a smooth texture and enhanced nutrition. Shipped countrywide.',
  'Ayola''s Special Ugali Blend is a carefully formulated flour mix that produces healthier ugali with enhanced nutritional value. Developed by food scientist Prisca Kiragu, this blend combines traditional maize with nutrient-dense indigenous grains for a ugali that looks, feels, and tastes familiar — but delivers significantly more nutrition. Customers also use it for healthier bread and other baked goods.',
  250, 'Per pack', '/images/products/ugali-blend.jpg',
  ARRAY['Enhanced Nutrition', 'Ships Countrywide', 'Versatile'],
  'Proprietary blend of maize flour, indigenous grains, and natural fortification',
  ARRAY['More iron than standard ugali', 'Added fiber', 'Enhanced minerals', 'Smooth texture'],
  'Best Seller', true, 1),

('pkg-002', 'ayola-uji-blend', 'Ayola Special Uji Blend',
  (SELECT id FROM public.categories WHERE slug = 'packaged'),
  'Premium porridge flour blend — our signature uji mix formulated for gut health, energy, and exceptional taste. Shipped countrywide.',
  'This is the same blend we use in our restaurant — now available as a packaged product shipped anywhere in Kenya. Our Special Uji Blend is a food scientist-formulated mix of heritage grains optimized for nutrition and taste. Customers love it for morning porridge, and many use it as a base for healthier baking. Each batch is carefully blended to ensure consistency.',
  600, 'Per pack', '/images/products/uji-blend.jpg',
  ARRAY['Food Scientist Formulated', 'Ships Countrywide', 'Gut Health'],
  'Proprietary blend of finger millet, sorghum, amaranth, and natural fortification',
  ARRAY['High in iron & calcium', 'Heritage grains', 'Gut-friendly', 'Sustained energy'],
  'Premium', true, 2),

('pkg-003', 'custom-flour-blend', 'Custom Flour Blend',
  (SELECT id FROM public.categories WHERE slug = 'packaged'),
  'Custom-formulated flour blends for specific health needs — customers use for healthier bread, pancakes, and more.',
  'Need something specific? Our food scientist can formulate custom flour blends tailored to your dietary needs — whether it''s higher protein, more fiber, gluten-free alternatives, or specialized blends for baking healthier bread. Contact us via WhatsApp to discuss your needs.',
  0, 'Custom', '/images/products/custom-blend.jpg',
  ARRAY['Custom Formulation', 'Health-Specific', 'By a Food Scientist'],
  'Custom — varies based on client needs',
  ARRAY['Tailored nutrition', 'Specific health goals', 'Expert formulation', 'Flexible'],
  'Custom Order', true, 3),

-- Breakfast
('bfast-001', 'healthy-breakfast', 'Healthy Breakfast Combo',
  (SELECT id FROM public.categories WHERE slug = 'breakfast'),
  'Start your day the Ayola way — a balanced breakfast combo with protein, whole grains, and fresh ingredients.',
  'Our breakfast combos are designed to give you sustained energy throughout the morning without the crash that comes from sugary or processed breakfasts. Featuring whole grains, quality protein, fresh vegetables, and our signature beverages, it''s the healthiest way to start your day in Kahawa Sukari.',
  400, 'Full breakfast', '/images/products/breakfast-combo.jpg',
  ARRAY['Balanced', 'Sustained Energy', 'Fresh Ingredients'],
  'Varies daily — eggs, whole grain bread, vegetables, Ayola beverage',
  ARRAY['Balanced macros', 'No refined sugar', 'Whole grains', 'Fresh & local'],
  NULL, true, 1),

('bfast-002', 'heavy-meal-combo', 'Heavy Meal Combo',
  (SELECT id FROM public.categories WHERE slug = 'breakfast'),
  'For those who need a serious meal — our heavy combo packs nutrition and flavor for the hungriest appetite.',
  'When you need real fuel, our heavy meal combo delivers. Generous portions of protein, our special ugali or grain accompaniment, fresh vegetables, and a beverage — this is a full, satisfying meal that also happens to be healthy. Perfect for lunch or an early dinner.',
  800, 'Heavy combo', '/images/products/heavy-meal.jpg',
  ARRAY['Generous Portions', 'High Protein', 'Full Meal'],
  'Premium protein (varies), Ayola special ugali, vegetables, side, beverage',
  ARRAY['High protein', 'Balanced nutrition', 'Satisfying portions', 'Quality ingredients'],
  'Full Meal', true, 2);
