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

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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
