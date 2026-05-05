-- Migration: hero default content columns
-- Safe to run on a fresh project (creates store_settings if missing)
-- or on an existing project (adds columns if missing).

-- ── 1. Create store_settings if it doesn't exist ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                        integer PRIMARY KEY CHECK (id = 1),
  store_name                text NOT NULL DEFAULT 'Rift & Root',
  support_email             text,
  support_phone             text,
  default_delivery_fee      integer NOT NULL DEFAULT 150,
  delivery_cities           text[] NOT NULL DEFAULT ARRAY['Nairobi'],
  order_notification_emails text[] NOT NULL DEFAULT '{}',
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- Seed the single row if it doesn't exist yet
INSERT INTO public.store_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Add hero config columns ────────────────────────────────────────────────
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS hero_bg_image_url    text,
  ADD COLUMN IF NOT EXISTS hero_eyebrow         text DEFAULT 'Earth-first · Est. 2018',
  ADD COLUMN IF NOT EXISTS hero_headline        text DEFAULT 'Where the Rift',
  ADD COLUMN IF NOT EXISTS hero_headline_accent text DEFAULT 'feeds the table.',
  ADD COLUMN IF NOT EXISTS hero_description     text DEFAULT 'Heritage African cooking, hand-crafted in small batches from the volcanic soils of the Rift Valley. Delivered to your door with care.',
  ADD COLUMN IF NOT EXISTS hero_cta_text        text DEFAULT 'Order Now',
  ADD COLUMN IF NOT EXISTS hero_cta_url         text DEFAULT '/shop',
  ADD COLUMN IF NOT EXISTS hero_cta2_text       text DEFAULT 'Our Story',
  ADD COLUMN IF NOT EXISTS hero_cta2_url        text DEFAULT '/story',
  ADD COLUMN IF NOT EXISTS hero_stat1_value     text DEFAULT '100%',
  ADD COLUMN IF NOT EXISTS hero_stat1_label     text DEFAULT 'Organic Heritage',
  ADD COLUMN IF NOT EXISTS hero_stat1_sub       text DEFAULT 'Certified & traceable',
  ADD COLUMN IF NOT EXISTS hero_stat2_value     text DEFAULT '42',
  ADD COLUMN IF NOT EXISTS hero_stat2_label     text DEFAULT 'Partner Farms',
  ADD COLUMN IF NOT EXISTS hero_stat2_sub       text DEFAULT 'Across the Rift Valley',
  ADD COLUMN IF NOT EXISTS hero_stat3_value     text DEFAULT '6+',
  ADD COLUMN IF NOT EXISTS hero_stat3_label     text DEFAULT 'Years Crafting',
  ADD COLUMN IF NOT EXISTS hero_stat3_sub       text DEFAULT 'Small-batch, every week';

-- ── 3. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read (needed for /api/site-config)
DO $$ BEGIN
  CREATE POLICY "Public read store_settings" ON public.store_settings
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

GRANT SELECT ON public.store_settings TO anon, authenticated;
