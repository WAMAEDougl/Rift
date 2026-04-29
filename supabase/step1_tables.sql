-- ============================================================
-- STEP 1: Create all tables, indexes, triggers
-- Run this first on a fresh Supabase project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  phone           text,
  email           text,
  role            text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'kitchen')),
  default_address text,
  default_city    text DEFAULT 'Nairobi',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             text UNIQUE NOT NULL,
  name             text NOT NULL,
  tagline          text,
  icon             text,
  description      text,
  color            text,
  bg_color         text,
  ships_countrywide boolean NOT NULL DEFAULT false,
  price_from       integer,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── products ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id            text UNIQUE,
  slug                 text UNIQUE NOT NULL,
  name                 text NOT NULL,
  category_id          uuid NOT NULL REFERENCES public.categories(id),
  description          text,
  long_description     text,
  price                integer NOT NULL,
  size                 text,
  image_url            text,
  features             text[] NOT NULL DEFAULT '{}',
  ingredients          text,
  nutrition_highlights text[] NOT NULL DEFAULT '{}',
  badge                text,
  in_stock             boolean NOT NULL DEFAULT true,
  is_active            boolean NOT NULL DEFAULT true,
  sort_order           integer NOT NULL DEFAULT 0,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products(slug);

-- ── orders ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number                text UNIQUE NOT NULL,
  customer_id                 uuid REFERENCES public.profiles(id),
  status                      text NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','confirmed','preparing','ready','dispatched','delivered','cancelled')),
  customer_name               text NOT NULL,
  customer_phone              text NOT NULL,
  customer_email              text,
  delivery_address            text NOT NULL,
  delivery_city               text NOT NULL DEFAULT 'Nairobi',
  delivery_type               text NOT NULL DEFAULT 'delivery'
                                CHECK (delivery_type IN ('delivery','pickup','shipping')),
  order_notes                 text,
  subtotal                    integer NOT NULL,
  delivery_fee                integer NOT NULL DEFAULT 0,
  total                       integer NOT NULL,
  payment_method              text NOT NULL CHECK (payment_method IN ('mpesa','cash_on_delivery','whatsapp')),
  payment_status              text NOT NULL DEFAULT 'pending'
                                CHECK (payment_status IN ('pending','processing','completed','failed','refunded')),
  mpesa_checkout_request_id   text,
  mpesa_receipt_number        text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  confirmed_at                timestamptz,
  completed_at                timestamptz
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);

-- ── order_items ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id),
  product_name  text NOT NULL,
  product_price integer NOT NULL,
  quantity      integer NOT NULL CHECK (quantity > 0),
  line_total    integer NOT NULL
);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

-- ── payment_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    uuid REFERENCES public.orders(id),
  provider    text NOT NULL DEFAULT 'mpesa',
  event_type  text NOT NULL,
  raw_payload jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── notifications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type       text NOT NULL CHECK (type IN ('new_order','payment_completed','payment_failed','order_cancelled')),
  title      text NOT NULL,
  message    text NOT NULL,
  order_id   uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);

-- ── store_settings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.store_settings (
  id                          integer PRIMARY KEY CHECK (id = 1),
  store_name                  text NOT NULL DEFAULT 'Ayola Foods KE',
  support_email               text,
  support_phone               text,
  default_delivery_fee        integer NOT NULL DEFAULT 150,
  delivery_cities             text[] NOT NULL DEFAULT ARRAY['Nairobi'],
  order_notification_emails   text[] NOT NULL DEFAULT '{}',
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- ── banners ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            text NOT NULL,
  subtitle         text,
  description      text,
  image_url        text NOT NULL,
  mobile_image_url text,
  link_url         text,
  link_text        text,
  position         text NOT NULL DEFAULT 'hero'
                     CHECK (position IN ('hero','promo_strip','middle','footer')),
  sort_order       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  starts_at        timestamptz,
  ends_at          timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── delivery_zones ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text NOT NULL,
  description    text,
  areas          text[] NOT NULL DEFAULT '{}',
  fee            integer NOT NULL DEFAULT 0,
  free_above     integer,
  estimated_days text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at triggers ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.banners
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.delivery_zones
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── auto-create profile on signup ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
