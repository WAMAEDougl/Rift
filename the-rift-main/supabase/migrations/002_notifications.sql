-- Rift & Root: Notifications table for admin dashboard

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('new_order', 'payment_completed', 'payment_failed', 'order_cancelled')),
  title text NOT NULL,
  message text NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read notifications"
  ON public.notifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'kitchen')));

CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'kitchen')));
