-- ============================================
-- PAGE CONTENT (JSON storage for CMS pages)
-- ============================================
CREATE TABLE IF NOT EXISTS public.page_content (
  page text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read page_content" ON public.page_content;
CREATE POLICY "Anyone can read page_content"
  ON public.page_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage page_content" ON public.page_content;
CREATE POLICY "Admins can manage page_content"
  ON public.page_content FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ============================================
-- FAQs
-- ============================================
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'general'
    CHECK (category IN ('ordering','shipping','products','health','restaurant','wholesale','general')),
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active faqs" ON public.faqs;
CREATE POLICY "Anyone can read active faqs"
  ON public.faqs FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs"
  ON public.faqs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- ============================================
-- TESTIMONIALS
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  location text,
  quote text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  product text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active testimonials" ON public.testimonials;
CREATE POLICY "Anyone can read active testimonials"
  ON public.testimonials FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));
