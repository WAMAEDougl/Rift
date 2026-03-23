-- STEP 1: Create all tables (run this FIRST)

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'kitchen')),
  default_address text,
  default_city text DEFAULT 'Nairobi',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  icon text,
  description text,
  color text,
  bg_color text,
  ships_countrywide boolean DEFAULT false,
  price_from integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id text UNIQUE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  description text,
  long_description text,
  price integer NOT NULL,
  size text,
  image_url text,
  features text[] DEFAULT '{}',
  ingredients text,
  nutrition_highlights text[] DEFAULT '{}',
  badge text,
  in_stock boolean DEFAULT true,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES public.profiles(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','preparing','ready','dispatched','delivered','cancelled')),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  delivery_address text NOT NULL,
  delivery_city text NOT NULL DEFAULT 'Nairobi',
  delivery_type text NOT NULL DEFAULT 'delivery'
    CHECK (delivery_type IN ('delivery','pickup','shipping')),
  order_notes text,
  subtotal integer NOT NULL,
  delivery_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa','cash_on_delivery')),
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','processing','completed','failed','refunded')),
  mpesa_checkout_request_id text,
  mpesa_receipt_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  completed_at timestamptz
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  product_price integer NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  line_total integer NOT NULL
);

CREATE TABLE public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  provider text NOT NULL,
  event_type text NOT NULL,
  raw_payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
