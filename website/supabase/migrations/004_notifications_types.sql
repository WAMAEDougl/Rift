-- Extend notifications.type CHECK constraint to include new types
-- for WhatsApp delivery negotiation feature

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
      'new_order',
      'payment_completed',
      'payment_failed',
      'order_cancelled',
      'delivery_negotiation_message',
      'whatsapp_sent'
    ));
