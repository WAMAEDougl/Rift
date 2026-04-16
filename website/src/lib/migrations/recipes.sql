-- =============================================================================
-- Migration: Create recipes table
-- Description: Creates the recipes table with all columns, constraints,
--              updated_at trigger, and seeds the 6 existing recipes.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create the recipes table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recipes (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT          NOT NULL UNIQUE,
  title               TEXT          NOT NULL,
  excerpt             TEXT          NOT NULL,
  content             TEXT          NOT NULL,
  category            TEXT          NOT NULL,
  video_url           TEXT          NOT NULL,
  video_platform      TEXT          NOT NULL,
  video_thumbnail_url TEXT,
  prep_time           TEXT,
  servings            TEXT,
  difficulty          TEXT          NOT NULL,
  ingredients         TEXT[],
  tags                TEXT[]        NOT NULL DEFAULT '{}',
  author              TEXT          NOT NULL,
  date                DATE          NOT NULL,
  featured            BOOLEAN       NOT NULL DEFAULT FALSE,
  related_product     TEXT,
  is_published        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- 2. Check constraints
-- ---------------------------------------------------------------------------
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_category_check
    CHECK (category IN ('cooking-demo', 'beverage', 'how-to', 'health-tip'));

ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_difficulty_check
    CHECK (difficulty IN ('Easy', 'Medium', 'Advanced'));

ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_video_platform_check
    CHECK (video_platform IN ('youtube', 'facebook', 'instagram', 'tiktok'));

-- ---------------------------------------------------------------------------
-- 3. Auto-update updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER recipes_set_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Seed data — 6 existing recipes from website/src/lib/recipes.ts
-- ---------------------------------------------------------------------------

-- Recipe 1: CEO Making Pilau
INSERT INTO public.recipes (
  slug, title, excerpt, content, category,
  video_url, video_platform, video_thumbnail_url,
  prep_time, servings, difficulty,
  ingredients, tags, author, date, featured, related_product, is_published
) VALUES (
  'ceo-making-pilau',
  'CEO Making Pilau — Ayola''s Signature Spiced Rice',
  'Watch Prisca Kiragu prepare Ayola''s signature pilau from scratch — richly spiced, healthy, and absolutely delicious.',
  E'## Ayola''s Signature Pilau\n\nOur pilau is one of the most requested dishes at Ayola Foods. In this video, CEO and food scientist Prisca Kiragu takes you through the preparation — from toasting the whole spices to the final plating.\n\n### What Makes Ayola Pilau Different\n\nUnlike regular pilau, we use:\n- **Whole spices** (cumin seeds, cardamom pods, cinnamon sticks, cloves) — no pre-ground shortcuts\n- **Premium basmati rice** for that perfect grain separation\n- **Natural seasonings only** — zero MSG\n- **Balanced protein** with quality minced meat and vegetables\n\n### Tips from Chef Prisca\n\n1. Always toast your whole spices in hot oil first — this releases their essential oils\n2. Use basmati rice and wash it 3 times before cooking\n3. The water-to-rice ratio is key: 1.5 cups water per 1 cup rice for pilau\n4. Let it steam on low heat for the last 10 minutes — don''t lift the lid!\n\n*Come try the real thing at our restaurant in Kahawa Sukari, or order for delivery!*',
  'cooking-demo',
  'https://www.youtube.com/watch?v=0RmZ4vwpAME',
  'youtube',
  NULL,
  '45 mins',
  '4-6 servings',
  'Medium',
  ARRAY[
    '2 cups basmati rice',
    '300g minced meat',
    '2 onions, sliced',
    '3 tomatoes, diced',
    'Cumin seeds, cardamom, cinnamon, cloves',
    'Garlic and ginger paste',
    'Salt to taste',
    '3 cups water',
    'Cooking oil'
  ],
  ARRAY['pilau', 'rice', 'main course', 'signature'],
  'Prisca Kiragu',
  '2026-02-15',
  TRUE,
  'pilau-spiced-up',
  TRUE
);

-- Recipe 2: Synbiotic Porridge Benefits
INSERT INTO public.recipes (
  slug, title, excerpt, content, category,
  video_url, video_platform, video_thumbnail_url,
  prep_time, servings, difficulty,
  ingredients, tags, author, date, featured, related_product, is_published
) VALUES (
  'synbiotic-porridge-benefits',
  'Synbiotic Porridge — Why Your Gut Needs This',
  'Learn how our fermented synbiotic porridge combines probiotics and prebiotics to transform your digestive health.',
  E'## What is Synbiotic Porridge?\n\n**Synbiotic** means combining **probiotics** (beneficial live bacteria) with **prebiotics** (food for those bacteria). When you consume both together, the probiotics survive better and work harder in your gut.\n\n### Why Fermented Porridge?\n\nTraditional Kenyan fermented porridge (uji wa kuchemsha) has been around for generations. At Ayola, we''ve taken this ancestral wisdom and applied modern food science:\n\n1. **Controlled fermentation** using specific Lactobacillus strains\n2. **Heritage grains** — finger millet and sorghum provide natural prebiotic fiber\n3. **Optimal fermentation time** — 24-48 hours for maximum probiotic count\n4. **No artificial preservatives** — fresh-made daily at our kitchen\n\n### Health Benefits\n\n- **Improved digestion** — probiotics break down food more efficiently\n- **Stronger immunity** — 70% of your immune system is in your gut\n- **Better nutrient absorption** — fermentation makes minerals more bioavailable\n- **Reduced bloating** — balanced gut flora reduces gas and discomfort\n\n### How to Enjoy It\n\nOur synbiotic porridge is served warm at the restaurant, or you can use our **Ayola Special Uji Blend** at home and ferment it yourself following our method.\n\n*Available daily at Ayola Foods, Ruhan Plaza, Kahawa Sukari.*',
  'health-tip',
  'https://www.instagram.com/reel/ayolafoods/',
  'instagram',
  NULL,
  '24-48 hours (fermentation)',
  '6-8 servings',
  'Easy',
  ARRAY[
    '1 cup Ayola Special Uji Blend',
    '3 cups warm water',
    'Natural fermentation starter (or previous batch)',
    'Honey to taste',
    'Warm milk for serving'
  ],
  ARRAY['porridge', 'gut health', 'probiotics', 'fermented', 'synbiotic'],
  'Prisca Kiragu',
  '2026-01-20',
  TRUE,
  'synbiotic-porridge',
  TRUE
);

-- Recipe 3: Plantain Probiotic Kvass
INSERT INTO public.recipes (
  slug, title, excerpt, content, category,
  video_url, video_platform, video_thumbnail_url,
  prep_time, servings, difficulty,
  ingredients, tags, author, date, featured, related_product, is_published
) VALUES (
  'plantain-probiotic-kvass',
  'How We Make Plantain Probiotic Kvass',
  'A behind-the-scenes look at Kenya''s first plantain-based probiotic beverage — from raw plantain to fermented goodness.',
  E'## Plantain Kvass: Innovation Meets Tradition\n\nKvass is a traditional fermented beverage originating from Eastern Europe. At Ayola Foods, we''ve reimagined it using **plantain** — a fruit rich in resistant starch, which acts as a powerful prebiotic.\n\n### Why Plantain?\n\nPlantain is an overlooked superfood in Kenya:\n- **Rich in resistant starch** — feeds beneficial gut bacteria\n- **High in potassium** — supports heart health\n- **Good source of vitamin B6** — essential for brain function\n- **Naturally sweet when ripe** — reduces the need for added sugar\n\n### The Fermentation Process\n\n1. **Select ripe plantains** — they should be yellow with some black spots\n2. **Peel and slice** into thin rounds\n3. **Add to filtered water** with a small amount of honey\n4. **Introduce fermentation cultures** — we use a proprietary blend of Lactobacillus strains\n5. **Ferment for 48-72 hours** at controlled room temperature\n6. **Strain and bottle** — serve chilled\n\n### The Result\n\nA slightly tangy, naturally fizzy, refreshing beverage packed with live probiotics. No artificial flavors, no preservatives, no added sugar beyond the natural plantain sweetness.\n\n*This is the first branded plantain probiotic beverage in Kenya''s food service sector.*',
  'beverage',
  'https://www.instagram.com/reel/ayolafoods/',
  'instagram',
  NULL,
  '48-72 hours',
  '8-10 servings',
  'Advanced',
  ARRAY[
    '4 ripe plantains',
    '1 liter filtered water',
    '2 tbsp raw honey',
    'Fermentation cultures (Lactobacillus blend)',
    'Glass jar with breathable cover'
  ],
  ARRAY['kvass', 'plantain', 'probiotic', 'fermented', 'beverage'],
  'Prisca Kiragu',
  '2026-02-01',
  TRUE,
  'plantain-kvass',
  TRUE
);

-- Recipe 4: Ayola Ugali Bread Recipe
INSERT INTO public.recipes (
  slug, title, excerpt, content, category,
  video_url, video_platform, video_thumbnail_url,
  prep_time, servings, difficulty,
  ingredients, tags, author, date, featured, related_product, is_published
) VALUES (
  'ayola-ugali-bread-recipe',
  'Healthier Bread Using Ayola Ugali Blend',
  'Our customers discovered that Ayola''s ugali blend makes incredible bread. Here''s how to do it at home.',
  E'## Bread from Ugali Flour? Yes!\n\nOne of the most exciting discoveries from our customers: **Ayola Special Ugali Blend makes fantastic bread**. The indigenous grains in our blend add nutrition, fiber, and a subtle nutty flavor that regular wheat bread can''t match.\n\n### Why It Works\n\nOur ugali blend contains a carefully balanced mix of maize flour and indigenous grains. When combined with wheat flour, it creates a bread that is:\n- **Higher in fiber** than standard white bread\n- **Richer in iron and minerals** from the indigenous grains\n- **Lower glycemic index** — more sustained energy\n- **Unique in flavor** — a subtle nuttiness that customers love\n\n### Recipe: Ayola Blend Bread\n\n**Ingredients:**\n- 2 cups wheat flour\n- 1 cup Ayola Special Ugali Blend\n- 1 packet instant yeast (10g)\n- 1 tsp salt\n- 1 tbsp sugar\n- 2 tbsp vegetable oil\n- 1.5 cups warm water\n\n**Method:**\n1. Mix dry ingredients (both flours, yeast, salt, sugar)\n2. Add oil and warm water, knead for 10 minutes until smooth\n3. Cover and let rise for 1 hour (until doubled)\n4. Punch down, shape into a loaf\n5. Place in a greased loaf pan, let rise 30 more minutes\n6. Bake at 180°C for 35-40 minutes until golden\n\n*Order Ayola Special Ugali Blend online — we ship countrywide!*',
  'how-to',
  'https://www.facebook.com/100087278121034/videos/',
  'facebook',
  NULL,
  '2 hours',
  '1 loaf',
  'Medium',
  ARRAY[
    '2 cups wheat flour',
    '1 cup Ayola Special Ugali Blend',
    '1 packet instant yeast (10g)',
    '1 tsp salt',
    '1 tbsp sugar',
    '2 tbsp vegetable oil',
    '1.5 cups warm water'
  ],
  ARRAY['bread', 'ugali blend', 'baking', 'healthy'],
  'Prisca Kiragu',
  '2026-03-01',
  FALSE,
  'ayola-ugali-blend',
  TRUE
);

-- Recipe 5: Goat Milk Chai
INSERT INTO public.recipes (
  slug, title, excerpt, content, category,
  video_url, video_platform, video_thumbnail_url,
  prep_time, servings, difficulty,
  ingredients, tags, author, date, featured, related_product, is_published
) VALUES (
  'goat-milk-chai-perfect',
  'The Perfect Goat Milk Chai',
  'Why goat milk makes better chai — easier to digest, creamier texture, and richer flavor. Here''s our method.',
  E'## Why Goat Milk Chai?\n\nAt Ayola Foods, our goat milk tea is one of the most popular beverages. Here''s why:\n\n### Goat Milk vs Cow Milk\n\n| Property | Goat Milk | Cow Milk |\n|----------|-----------|----------|\n| Fat globules | Smaller (easier to digest) | Larger |\n| A2 casein | Naturally A2 | Often A1 |\n| Calcium | Higher | Standard |\n| Potassium | Higher | Standard |\n| Vitamin A | Higher | Standard |\n\n### Our Recipe\n\n1. **Start with fresh goat milk** — quality matters\n2. **Add Kenyan black tea** (we use loose leaf, not bags)\n3. **Crush the spices fresh**: ginger, cardamom, cinnamon\n4. **Simmer, don''t boil** — boiling changes the flavor\n5. **Sweeten with honey** — not sugar\n\n### The Method\n\n- Bring 2 cups water to a simmer\n- Add 2 tsp loose black tea and crushed ginger\n- Simmer for 3 minutes\n- Add 2 cups fresh goat milk and spices\n- Heat until just before boiling (you''ll see tiny bubbles)\n- Strain and add honey to taste\n\n*Visit us at Ruhan Plaza, Kahawa Sukari for a cup!*',
  'beverage',
  'https://www.tiktok.com/@priscakiragu',
  'tiktok',
  NULL,
  '10 mins',
  '2 cups',
  'Easy',
  ARRAY[
    '2 cups fresh goat milk',
    '2 cups water',
    '2 tsp loose Kenyan black tea',
    '1 inch fresh ginger, crushed',
    '3 cardamom pods, crushed',
    '1 small cinnamon stick',
    'Honey to taste'
  ],
  ARRAY['chai', 'goat milk', 'tea', 'beverage', 'easy'],
  'Prisca Kiragu',
  '2026-02-20',
  FALSE,
  'goat-milk-tea',
  TRUE
);

-- Recipe 6: Rabbit Wet Fry Tutorial
INSERT INTO public.recipes (
  slug, title, excerpt, content, category,
  video_url, video_platform, video_thumbnail_url,
  prep_time, servings, difficulty,
  ingredients, tags, author, date, featured, related_product, is_published
) VALUES (
  'rabbit-wet-fry-tutorial',
  'How to Make Rabbit Wet Fry — The Ayola Way',
  'Rabbit is one of the healthiest meats available. Watch how we prepare our signature rabbit wet fry combo.',
  E'## Rabbit: The Underrated Superfood Meat\n\nMost Kenyans haven''t tried rabbit — but those who have keep coming back. Here''s why:\n\n### Nutritional Profile (per 100g)\n\n| Nutrient | Rabbit | Chicken | Beef |\n|----------|--------|---------|------|\n| Protein | 29g | 27g | 26g |\n| Fat | 3.5g | 14g | 15g |\n| Cholesterol | 57mg | 75mg | 90mg |\n| Iron | 1.6mg | 0.9mg | 2.6mg |\n\n**Rabbit is the leanest commonly available meat** — more protein, less fat, less cholesterol.\n\n### Ayola''s Wet Fry Method\n\n1. **Clean and portion** the rabbit into serving pieces\n2. **Marinate** with garlic, ginger, salt, and lemon juice for 30 minutes\n3. **Sear** in hot oil until golden on all sides\n4. **Add aromatics** — onions, tomatoes, bell peppers\n5. **Simmer in sauce** with a splash of water for 25-30 minutes until tender\n6. **Finish** with fresh coriander and serve with Ayola Special Ugali\n\n### Why We Love Rabbit at Ayola\n\nIt aligns perfectly with our "eat healthy, enjoy life" philosophy — it''s unconventional, nutritious, and absolutely delicious when prepared properly.\n\n*Our rabbit wet fry combo is available daily at the restaurant — KES 800 with greens and special ugali.*',
  'cooking-demo',
  'https://www.instagram.com/reel/ayolafoods/',
  'instagram',
  NULL,
  '1 hour',
  '3-4 servings',
  'Medium',
  ARRAY[
    '1 whole rabbit, portioned',
    '4 tomatoes, diced',
    '2 onions, sliced',
    '2 bell peppers, sliced',
    '4 cloves garlic, minced',
    '1 inch ginger, grated',
    'Fresh coriander',
    'Salt, lemon juice',
    'Cooking oil'
  ],
  ARRAY['rabbit', 'wet fry', 'main course', 'high protein', 'low fat'],
  'Prisca Kiragu',
  '2026-03-10',
  TRUE,
  'rabbit-wet-fry',
  TRUE
);
