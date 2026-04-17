-- WhatsApp Delivery Negotiation: Phase 1 - Schema Extensions
-- Extends orders.status CHECK constraint and creates order_audit_logs table

-- ============================================
-- EXTEND orders.status CHECK CONSTRAINT
-- ============================================
-- Drop the existing CHECK constraint and recreate it with the new status value.
-- Existing orders with status 'pending' are unaffected.
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
    CHECK (status IN (
      'pending_delivery_confirmation',
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'dispatched',
      'delivered',
      'cancelled'
    ));

-- ============================================
-- ORDER AUDIT LOGS
-- ============================================
CREATE TABLE public.order_audit_logs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event_type        text        NOT NULL,
  delivery_fee      integer     NOT NULL,
  authorized_by_id  uuid        NOT NULL REFERENCES public.profiles(id),
  authorized_by_name text       NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_order_audit_logs_order   ON public.order_audit_logs(order_id);
CREATE INDEX idx_order_audit_logs_created ON public.order_audit_logs(created_at DESC);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE public.order_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================
-- Admins can read audit log entries
CREATE POLICY "Admins can read order audit logs"
  ON public.order_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can insert audit log entries (service role used by API routes)
CREATE POLICY "Admins can insert order audit logs"
  ON public.order_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role bypass for API writes (no auth.uid() in server-side service role context)
CREATE POLICY "Service role can insert order audit logs"
  ON public.order_audit_logs FOR INSERT
  WITH CHECK (true);
