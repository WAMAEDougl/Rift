-- STEP 3: Store settings (single-row table)

CREATE TABLE public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text DEFAULT 'Ayola Foods KE',
  support_email text,
  support_phone text,
  default_delivery_fee integer DEFAULT 150,
  delivery_cities text[] DEFAULT ARRAY['Nairobi'],
  order_notification_emails text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Seed the single row
INSERT INTO public.store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- updated_at trigger (reuses function from step1)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
