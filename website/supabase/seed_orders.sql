-- Run after step1_tables.sql, step2_notifications.sql, step3_settings.sql, and seed.sql
-- Seed data for Ayola Foods admin dashboard demo
-- Can be re-run safely (all inserts use ON CONFLICT DO NOTHING)

-- ============================================================
-- ORDERS
-- ============================================================

INSERT INTO public.orders (
  id, order_number, customer_name, customer_phone, customer_email,
  delivery_address, delivery_city, delivery_type,
  subtotal, delivery_fee, total,
  payment_method, payment_status, status,
  order_notes, created_at
) VALUES

-- 3 pending (mpesa)
(
  'a1b2c3d4-0001-0000-0000-000000000001',
  'AYF-100001',
  'Jane Wanjiku', '0712345001', 'jane.wanjiku@email.com',
  '14 Westlands Road, Westlands', 'Nairobi', 'delivery',
  750, 150, 900,
  'mpesa', 'processing', 'pending',
  NULL,
  NOW() - INTERVAL '1 day' + INTERVAL '9 hours 15 minutes'
),
(
  'a1b2c3d4-0002-0000-0000-000000000002',
  'AYF-100002',
  'Brian Otieno', '0722345002', NULL,
  'Apt 3B, Valley Arcade, Lavington', 'Nairobi', 'delivery',
  1200, 150, 1350,
  'mpesa', 'processing', 'pending',
  'Please call when nearby',
  NOW() - INTERVAL '1 day' + INTERVAL '11 hours 40 minutes'
),
(
  'a1b2c3d4-0003-0000-0000-000000000003',
  'AYF-100003',
  'Lydia Njeri', '0733345003', 'lydia.njeri@gmail.com',
  '5 Kileleshwa Close, Kileleshwa', 'Nairobi', 'delivery',
  600, 150, 750,
  'mpesa', 'processing', 'pending',
  NULL,
  NOW() - INTERVAL '0 days' + INTERVAL '8 hours 5 minutes'
),

-- 3 confirmed (mpesa)
(
  'a1b2c3d4-0004-0000-0000-000000000004',
  'AYF-100004',
  'Mwangi Kamau', '0714345004', NULL,
  'Parklands Road, off 3rd Avenue', 'Nairobi', 'delivery',
  800, 150, 950,
  'mpesa', 'completed', 'confirmed',
  'Extra chilli please',
  NOW() - INTERVAL '2 days' + INTERVAL '10 hours 20 minutes'
),
(
  'a1b2c3d4-0005-0000-0000-000000000005',
  'AYF-100005',
  'Grace Achieng', '0723345005', 'grace.achieng@email.com',
  '22 Lower Kabete Road, Loresho', 'Nairobi', 'delivery',
  1400, 150, 1550,
  'mpesa', 'completed', 'confirmed',
  NULL,
  NOW() - INTERVAL '2 days' + INTERVAL '14 hours 30 minutes'
),
(
  'a1b2c3d4-0006-0000-0000-000000000006',
  'AYF-100006',
  'Peter Mutua', '0734345006', NULL,
  'Karen Hardy, Karen', 'Nairobi', 'delivery',
  500, 150, 650,
  'mpesa', 'completed', 'confirmed',
  'Vegetarian, no eggs',
  NOW() - INTERVAL '3 days' + INTERVAL '9 hours 10 minutes'
),

-- 3 preparing (mpesa)
(
  'a1b2c3d4-0007-0000-0000-000000000007',
  'AYF-100007',
  'Sandra Wambui', '0715345007', 'sandra.w@email.com',
  '7 Ngong Road, Adams Arcade', 'Nairobi', 'delivery',
  600, 150, 750,
  'mpesa', 'completed', 'preparing',
  NULL,
  NOW() - INTERVAL '3 days' + INTERVAL '12 hours 45 minutes'
),
(
  'a1b2c3d4-0008-0000-0000-000000000008',
  'AYF-100008',
  'James Kariuki', '0724345008', NULL,
  'Kilimani Road, Yaya Centre area', 'Nairobi', 'delivery',
  1600, 150, 1750,
  'mpesa', 'completed', 'preparing',
  'Leave at the gate',
  NOW() - INTERVAL '4 days' + INTERVAL '10 hours 0 minutes'
),
(
  'a1b2c3d4-0009-0000-0000-000000000009',
  'AYF-100009',
  'Esther Auma', '0735345009', 'esther.auma@gmail.com',
  '11 Riverside Drive, Westlands', 'Nairobi', 'delivery',
  800, 0, 800,
  'cash_on_delivery', 'pending', 'preparing',
  NULL,
  NOW() - INTERVAL '4 days' + INTERVAL '15 hours 20 minutes'
),

-- 2 ready (cash_on_delivery)
(
  'a1b2c3d4-0010-0000-0000-000000000010',
  'AYF-100010',
  'Kevin Waweru', '0716345010', NULL,
  'Hurlingham Road, Hurlingham', 'Nairobi', 'delivery',
  900, 150, 1050,
  'cash_on_delivery', 'pending', 'ready',
  'Call before leaving',
  NOW() - INTERVAL '5 days' + INTERVAL '11 hours 30 minutes'
),
(
  'a1b2c3d4-0011-0000-0000-000000000011',
  'AYF-100011',
  'Carol Muthoni', '0725345011', 'carol.m@email.com',
  'Spring Valley, off Peponi Road', 'Nairobi', 'delivery',
  1200, 150, 1350,
  'mpesa', 'completed', 'ready',
  NULL,
  NOW() - INTERVAL '5 days' + INTERVAL '13 hours 15 minutes'
),

-- 2 dispatched (mpesa)
(
  'a1b2c3d4-0012-0000-0000-000000000012',
  'AYF-100012',
  'David Omondi', '0736345012', NULL,
  'Kilimani, off Galana Road', 'Nairobi', 'delivery',
  500, 150, 650,
  'mpesa', 'completed', 'dispatched',
  NULL,
  NOW() - INTERVAL '6 days' + INTERVAL '10 hours 5 minutes'
),
(
  'a1b2c3d4-0013-0000-0000-000000000013',
  'AYF-100013',
  'Faith Nyambura', '0717345013', 'faith.nyambura@gmail.com',
  'Lavington Green Shopping Centre area', 'Nairobi', 'delivery',
  1000, 150, 1150,
  'mpesa', 'completed', 'dispatched',
  'Ring bell twice',
  NOW() - INTERVAL '6 days' + INTERVAL '12 hours 50 minutes'
),

-- 4 delivered (mix mpesa + cash)
(
  'a1b2c3d4-0014-0000-0000-000000000014',
  'AYF-100014',
  'Joseph Gitau', '0726345014', NULL,
  'Runda Estate, off Kiambu Road', 'Nairobi', 'delivery',
  1600, 150, 1750,
  'mpesa', 'completed', 'delivered',
  NULL,
  NOW() - INTERVAL '10 days' + INTERVAL '9 hours 0 minutes'
),
(
  'a1b2c3d4-0015-0000-0000-000000000015',
  'AYF-100015',
  'Alice Wairimu', '0737345015', 'alice.w@email.com',
  '3 Kiambu Road, Garden Estate', 'Nairobi', 'delivery',
  800, 150, 950,
  'cash_on_delivery', 'completed', 'delivered',
  NULL,
  NOW() - INTERVAL '14 days' + INTERVAL '10 hours 30 minutes'
),
(
  'a1b2c3d4-0016-0000-0000-000000000016',
  'AYF-100016',
  'Patrick Njoroge', '0718345016', NULL,
  'Muthaiga Road, Muthaiga', 'Nairobi', 'delivery',
  1200, 150, 1350,
  'mpesa', 'completed', 'delivered',
  NULL,
  NOW() - INTERVAL '18 days' + INTERVAL '11 hours 45 minutes'
),
(
  'a1b2c3d4-0017-0000-0000-000000000017',
  'AYF-100017',
  'Nancy Chebet', '0727345017', 'nancy.chebet@email.com',
  'Gigiri Road, Gigiri', 'Nairobi', 'delivery',
  600, 0, 600,
  'cash_on_delivery', 'completed', 'delivered',
  'No onions',
  NOW() - INTERVAL '22 days' + INTERVAL '14 hours 20 minutes'
),

-- 3 cancelled (mix)
(
  'a1b2c3d4-0018-0000-0000-000000000018',
  'AYF-100018',
  'Samuel Kimani', '0738345018', NULL,
  'South B, Mombasa Road area', 'Nairobi', 'delivery',
  800, 150, 950,
  'mpesa', 'refunded', 'cancelled',
  NULL,
  NOW() - INTERVAL '7 days' + INTERVAL '9 hours 30 minutes'
),
(
  'a1b2c3d4-0019-0000-0000-000000000019',
  'AYF-100019',
  'Rose Kerubo', '0719345019', 'rose.k@gmail.com',
  'South C, near Airport North Road', 'Nairobi', 'delivery',
  500, 150, 650,
  'mpesa', 'refunded', 'cancelled',
  'Changed mind',
  NOW() - INTERVAL '12 days' + INTERVAL '16 hours 0 minutes'
),
(
  'a1b2c3d4-0020-0000-0000-000000000020',
  'AYF-100020',
  'Daniel Onyango', '0728345020', NULL,
  'Eastleigh, 1st Avenue', 'Nairobi', 'delivery',
  1200, 150, 1350,
  'cash_on_delivery', 'pending', 'cancelled',
  'Could not be reached',
  NOW() - INTERVAL '25 days' + INTERVAL '13 hours 10 minutes'
)

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- ORDER ITEMS
-- ============================================================

INSERT INTO public.order_items (order_id, product_id, product_name, product_price, quantity, line_total) VALUES

-- Order 1: 2x Pilau
('a1b2c3d4-0001-0000-0000-000000000001',
 (SELECT id FROM public.products WHERE slug = 'pilau-spiced-up'),
 'Pilau — Spiced Up Edition', 600, 1, 600),
('a1b2c3d4-0001-0000-0000-000000000001',
 (SELECT id FROM public.products WHERE slug = 'goat-milk-tea'),
 'Goat Milk Tea', 150, 1, 150),

-- Order 2: Rabbit Wet Fry + Plantain Kvass
('a1b2c3d4-0002-0000-0000-000000000002',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),
('a1b2c3d4-0002-0000-0000-000000000002',
 (SELECT id FROM public.products WHERE slug = 'plantain-kvass'),
 'Plantain Probiotic Kvass', 200, 2, 400),

-- Order 3: Turkey Eggs combo
('a1b2c3d4-0003-0000-0000-000000000003',
 (SELECT id FROM public.products WHERE slug = 'turkey-eggs-afkeido'),
 'Turkey Eggs + Toasted Bread + Afkeido Combo', 600, 1, 600),

-- Order 4: Rabbit Wet Fry
('a1b2c3d4-0004-0000-0000-000000000004',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),

-- Order 5: Heavy Meal + Synbiotic Porridge
('a1b2c3d4-0005-0000-0000-000000000005',
 (SELECT id FROM public.products WHERE slug = 'heavy-meal-combo'),
 'Heavy Meal Combo', 800, 1, 800),
('a1b2c3d4-0005-0000-0000-000000000005',
 (SELECT id FROM public.products WHERE slug = 'synbiotic-porridge'),
 'Synbiotic Porridge', 150, 2, 300),
('a1b2c3d4-0005-0000-0000-000000000005',
 (SELECT id FROM public.products WHERE slug = 'goat-milk-tea'),
 'Goat Milk Tea', 150, 2, 300),

-- Order 6: Vegan Combo
('a1b2c3d4-0006-0000-0000-000000000006',
 (SELECT id FROM public.products WHERE slug = 'vegan-combo'),
 'Vegetarian / Vegan Combo', 500, 1, 500),

-- Order 7: Pilau + Plantain Kvass
('a1b2c3d4-0007-0000-0000-000000000007',
 (SELECT id FROM public.products WHERE slug = 'pilau-spiced-up'),
 'Pilau — Spiced Up Edition', 600, 1, 600),

-- Order 8: 2x Rabbit + Heavy Meal
('a1b2c3d4-0008-0000-0000-000000000008',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),
('a1b2c3d4-0008-0000-0000-000000000008',
 (SELECT id FROM public.products WHERE slug = 'heavy-meal-combo'),
 'Heavy Meal Combo', 800, 1, 800),

-- Order 9: Rabbit Wet Fry
('a1b2c3d4-0009-0000-0000-000000000009',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),

-- Order 10: Healthy Breakfast + Special Uji
('a1b2c3d4-0010-0000-0000-000000000010',
 (SELECT id FROM public.products WHERE slug = 'healthy-breakfast'),
 'Healthy Breakfast Combo', 400, 2, 800),
('a1b2c3d4-0010-0000-0000-000000000010',
 (SELECT id FROM public.products WHERE slug = 'special-uji-drink'),
 'Special Uji (Porridge Drink)', 120, 1, 120),

-- Order 11: Pilau + Rabbit
('a1b2c3d4-0011-0000-0000-000000000011',
 (SELECT id FROM public.products WHERE slug = 'pilau-spiced-up'),
 'Pilau — Spiced Up Edition', 600, 1, 600),
('a1b2c3d4-0011-0000-0000-000000000011',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),

-- Order 12: Vegan Combo
('a1b2c3d4-0012-0000-0000-000000000012',
 (SELECT id FROM public.products WHERE slug = 'vegan-combo'),
 'Vegetarian / Vegan Combo', 500, 1, 500),

-- Order 13: Healthy Breakfast + Synbiotic + Goat Milk
('a1b2c3d4-0013-0000-0000-000000000013',
 (SELECT id FROM public.products WHERE slug = 'healthy-breakfast'),
 'Healthy Breakfast Combo', 400, 2, 800),
('a1b2c3d4-0013-0000-0000-000000000013',
 (SELECT id FROM public.products WHERE slug = 'synbiotic-porridge'),
 'Synbiotic Porridge', 150, 1, 150),

-- Order 14: 2x Heavy Meal + Beverages
('a1b2c3d4-0014-0000-0000-000000000014',
 (SELECT id FROM public.products WHERE slug = 'heavy-meal-combo'),
 'Heavy Meal Combo', 800, 1, 800),
('a1b2c3d4-0014-0000-0000-000000000014',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),

-- Order 15: Rabbit Wet Fry
('a1b2c3d4-0015-0000-0000-000000000015',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),

-- Order 16: Pilau + Heavy Meal
('a1b2c3d4-0016-0000-0000-000000000016',
 (SELECT id FROM public.products WHERE slug = 'pilau-spiced-up'),
 'Pilau — Spiced Up Edition', 600, 1, 600),
('a1b2c3d4-0016-0000-0000-000000000016',
 (SELECT id FROM public.products WHERE slug = 'heavy-meal-combo'),
 'Heavy Meal Combo', 800, 1, 800),

-- Order 17: Turkey Eggs
('a1b2c3d4-0017-0000-0000-000000000017',
 (SELECT id FROM public.products WHERE slug = 'turkey-eggs-afkeido'),
 'Turkey Eggs + Toasted Bread + Afkeido Combo', 600, 1, 600),

-- Order 18: Rabbit (cancelled)
('a1b2c3d4-0018-0000-0000-000000000018',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800),

-- Order 19: Vegan (cancelled)
('a1b2c3d4-0019-0000-0000-000000000019',
 (SELECT id FROM public.products WHERE slug = 'vegan-combo'),
 'Vegetarian / Vegan Combo', 500, 1, 500),

-- Order 20: Pilau + Rabbit (cancelled)
('a1b2c3d4-0020-0000-0000-000000000020',
 (SELECT id FROM public.products WHERE slug = 'pilau-spiced-up'),
 'Pilau — Spiced Up Edition', 600, 1, 600),
('a1b2c3d4-0020-0000-0000-000000000020',
 (SELECT id FROM public.products WHERE slug = 'rabbit-wet-fry'),
 'Rabbit Wet Fry Combo', 800, 1, 800)

ON CONFLICT DO NOTHING;


-- ============================================================
-- PAYMENT LOGS (mpesa orders — completed ones)
-- ============================================================

INSERT INTO public.payment_logs (order_id, provider, event_type, raw_payload, created_at) VALUES

-- Orders with payment_status = 'completed' via mpesa
('a1b2c3d4-0004-0000-0000-000000000004', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_040001","MerchantRequestID":"mr_040001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '2 days' + INTERVAL '10 hours 5 minutes'),
('a1b2c3d4-0004-0000-0000-000000000004', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_040001","CheckoutRequestID":"ws_CO_040001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":950},{"Name":"MpesaReceiptNumber","Value":"RFZ1234ABC"},{"Name":"TransactionDate","Value":20260401101500},{"Name":"PhoneNumber","Value":254714345004}]}}}}',
 NOW() - INTERVAL '2 days' + INTERVAL '10 hours 16 minutes'),

('a1b2c3d4-0005-0000-0000-000000000005', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_050001","MerchantRequestID":"mr_050001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '2 days' + INTERVAL '14 hours 15 minutes'),
('a1b2c3d4-0005-0000-0000-000000000005', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_050001","CheckoutRequestID":"ws_CO_050001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1550},{"Name":"MpesaReceiptNumber","Value":"RFZ2345BCD"},{"Name":"TransactionDate","Value":20260401143000},{"Name":"PhoneNumber","Value":254723345005}]}}}}',
 NOW() - INTERVAL '2 days' + INTERVAL '14 hours 31 minutes'),

('a1b2c3d4-0006-0000-0000-000000000006', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_060001","MerchantRequestID":"mr_060001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '3 days' + INTERVAL '8 hours 55 minutes'),
('a1b2c3d4-0006-0000-0000-000000000006', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_060001","CheckoutRequestID":"ws_CO_060001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":650},{"Name":"MpesaReceiptNumber","Value":"RFZ3456CDE"},{"Name":"TransactionDate","Value":20260331091000},{"Name":"PhoneNumber","Value":254734345006}]}}}}',
 NOW() - INTERVAL '3 days' + INTERVAL '9 hours 11 minutes'),

('a1b2c3d4-0007-0000-0000-000000000007', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_070001","MerchantRequestID":"mr_070001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '3 days' + INTERVAL '12 hours 30 minutes'),
('a1b2c3d4-0007-0000-0000-000000000007', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_070001","CheckoutRequestID":"ws_CO_070001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":750},{"Name":"MpesaReceiptNumber","Value":"RFZ4567DEF"},{"Name":"TransactionDate","Value":20260330124500},{"Name":"PhoneNumber","Value":254715345007}]}}}}',
 NOW() - INTERVAL '3 days' + INTERVAL '12 hours 46 minutes'),

('a1b2c3d4-0008-0000-0000-000000000008', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_080001","MerchantRequestID":"mr_080001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '4 days' + INTERVAL '9 hours 45 minutes'),
('a1b2c3d4-0008-0000-0000-000000000008', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_080001","CheckoutRequestID":"ws_CO_080001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1750},{"Name":"MpesaReceiptNumber","Value":"RFZ5678EFG"},{"Name":"TransactionDate","Value":20260329100000},{"Name":"PhoneNumber","Value":254724345008}]}}}}',
 NOW() - INTERVAL '4 days' + INTERVAL '10 hours 1 minute'),

('a1b2c3d4-0011-0000-0000-000000000011', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_110001","MerchantRequestID":"mr_110001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '5 days' + INTERVAL '13 hours 0 minutes'),
('a1b2c3d4-0011-0000-0000-000000000011', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_110001","CheckoutRequestID":"ws_CO_110001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1350},{"Name":"MpesaReceiptNumber","Value":"RFZ6789FGH"},{"Name":"TransactionDate","Value":20260328131500},{"Name":"PhoneNumber","Value":254725345011}]}}}}',
 NOW() - INTERVAL '5 days' + INTERVAL '13 hours 16 minutes'),

('a1b2c3d4-0012-0000-0000-000000000012', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_120001","MerchantRequestID":"mr_120001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '6 days' + INTERVAL '9 hours 50 minutes'),
('a1b2c3d4-0012-0000-0000-000000000012', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_120001","CheckoutRequestID":"ws_CO_120001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":650},{"Name":"MpesaReceiptNumber","Value":"RFZ7890GHI"},{"Name":"TransactionDate","Value":20260327100500},{"Name":"PhoneNumber","Value":254736345012}]}}}}',
 NOW() - INTERVAL '6 days' + INTERVAL '10 hours 6 minutes'),

('a1b2c3d4-0013-0000-0000-000000000013', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_130001","MerchantRequestID":"mr_130001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '6 days' + INTERVAL '12 hours 35 minutes'),
('a1b2c3d4-0013-0000-0000-000000000013', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_130001","CheckoutRequestID":"ws_CO_130001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1150},{"Name":"MpesaReceiptNumber","Value":"RFZ8901HIJ"},{"Name":"TransactionDate","Value":20260327125000},{"Name":"PhoneNumber","Value":254717345013}]}}}}',
 NOW() - INTERVAL '6 days' + INTERVAL '12 hours 51 minutes'),

('a1b2c3d4-0014-0000-0000-000000000014', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_140001","MerchantRequestID":"mr_140001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '10 days' + INTERVAL '8 hours 45 minutes'),
('a1b2c3d4-0014-0000-0000-000000000014', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_140001","CheckoutRequestID":"ws_CO_140001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1750},{"Name":"MpesaReceiptNumber","Value":"RFZ9012IJK"},{"Name":"TransactionDate","Value":20260323090000},{"Name":"PhoneNumber","Value":254726345014}]}}}}',
 NOW() - INTERVAL '10 days' + INTERVAL '9 hours 1 minute'),

('a1b2c3d4-0016-0000-0000-000000000016', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_160001","MerchantRequestID":"mr_160001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '18 days' + INTERVAL '11 hours 30 minutes'),
('a1b2c3d4-0016-0000-0000-000000000016', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_160001","CheckoutRequestID":"ws_CO_160001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":1350},{"Name":"MpesaReceiptNumber","Value":"RFZ0123JKL"},{"Name":"TransactionDate","Value":20260315114500},{"Name":"PhoneNumber","Value":254718345016}]}}}}',
 NOW() - INTERVAL '18 days' + INTERVAL '11 hours 46 minutes'),

-- Refunded mpesa orders (cancelled)
('a1b2c3d4-0018-0000-0000-000000000018', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_180001","MerchantRequestID":"mr_180001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '7 days' + INTERVAL '9 hours 15 minutes'),
('a1b2c3d4-0018-0000-0000-000000000018', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_180001","CheckoutRequestID":"ws_CO_180001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":950},{"Name":"MpesaReceiptNumber","Value":"RFZ1234KLM"},{"Name":"TransactionDate","Value":20260326093000},{"Name":"PhoneNumber","Value":254738345018}]}}}}',
 NOW() - INTERVAL '7 days' + INTERVAL '9 hours 31 minutes'),

('a1b2c3d4-0019-0000-0000-000000000019', 'mpesa', 'stk_push_initiated',
 '{"CheckoutRequestID":"ws_CO_190001","MerchantRequestID":"mr_190001","ResponseCode":"0","ResponseDescription":"Success. Request accepted for processing","CustomerMessage":"Success. Request accepted for processing"}',
 NOW() - INTERVAL '12 days' + INTERVAL '15 hours 45 minutes'),
('a1b2c3d4-0019-0000-0000-000000000019', 'mpesa', 'stk_callback',
 '{"Body":{"stkCallback":{"MerchantRequestID":"mr_190001","CheckoutRequestID":"ws_CO_190001","ResultCode":0,"ResultDesc":"The service request is processed successfully.","CallbackMetadata":{"Item":[{"Name":"Amount","Value":650},{"Name":"MpesaReceiptNumber","Value":"RFZ2345LMN"},{"Name":"TransactionDate","Value":20260321160000},{"Name":"PhoneNumber","Value":254719345019}]}}}}',
 NOW() - INTERVAL '12 days' + INTERVAL '16 hours 1 minute')

ON CONFLICT DO NOTHING;


-- ============================================================
-- NOTIFICATIONS
-- ============================================================

INSERT INTO public.notifications (id, type, title, message, order_id, is_read, created_at) VALUES

('b1c2d3e4-0001-0000-0000-000000000001', 'new_order', 'New Order Received',
 'Jane Wanjiku placed order AYF-100001 for KES 900.',
 'a1b2c3d4-0001-0000-0000-000000000001', false,
 NOW() - INTERVAL '1 day' + INTERVAL '9 hours 16 minutes'),

('b1c2d3e4-0002-0000-0000-000000000002', 'new_order', 'New Order Received',
 'Brian Otieno placed order AYF-100002 for KES 1,350.',
 'a1b2c3d4-0002-0000-0000-000000000002', false,
 NOW() - INTERVAL '1 day' + INTERVAL '11 hours 41 minutes'),

('b1c2d3e4-0003-0000-0000-000000000003', 'new_order', 'New Order Received',
 'Lydia Njeri placed order AYF-100003 for KES 750.',
 'a1b2c3d4-0003-0000-0000-000000000003', false,
 NOW() - INTERVAL '0 days' + INTERVAL '8 hours 6 minutes'),

('b1c2d3e4-0004-0000-0000-000000000004', 'payment_completed', 'Payment Confirmed',
 'M-Pesa payment of KES 950 received for order AYF-100004. Receipt: RFZ1234ABC.',
 'a1b2c3d4-0004-0000-0000-000000000004', false,
 NOW() - INTERVAL '2 days' + INTERVAL '10 hours 17 minutes'),

('b1c2d3e4-0005-0000-0000-000000000005', 'payment_completed', 'Payment Confirmed',
 'M-Pesa payment of KES 1,550 received for order AYF-100005. Receipt: RFZ2345BCD.',
 'a1b2c3d4-0005-0000-0000-000000000005', false,
 NOW() - INTERVAL '2 days' + INTERVAL '14 hours 32 minutes'),

('b1c2d3e4-0006-0000-0000-000000000006', 'new_order', 'New Order Received',
 'Peter Mutua placed order AYF-100006 for KES 650.',
 'a1b2c3d4-0006-0000-0000-000000000006', true,
 NOW() - INTERVAL '3 days' + INTERVAL '9 hours 11 minutes'),

('b1c2d3e4-0007-0000-0000-000000000007', 'payment_completed', 'Payment Confirmed',
 'M-Pesa payment of KES 750 received for order AYF-100007. Receipt: RFZ4567DEF.',
 'a1b2c3d4-0007-0000-0000-000000000007', true,
 NOW() - INTERVAL '3 days' + INTERVAL '12 hours 47 minutes'),

('b1c2d3e4-0008-0000-0000-000000000008', 'payment_completed', 'Payment Confirmed',
 'M-Pesa payment of KES 1,750 received for order AYF-100008. Receipt: RFZ5678EFG.',
 'a1b2c3d4-0008-0000-0000-000000000008', true,
 NOW() - INTERVAL '4 days' + INTERVAL '10 hours 2 minutes'),

('b1c2d3e4-0009-0000-0000-000000000009', 'order_cancelled', 'Order Cancelled',
 'Order AYF-100018 by Samuel Kimani has been cancelled. M-Pesa refund initiated.',
 'a1b2c3d4-0018-0000-0000-000000000018', true,
 NOW() - INTERVAL '7 days' + INTERVAL '10 hours 0 minutes'),

('b1c2d3e4-0010-0000-0000-000000000010', 'order_cancelled', 'Order Cancelled',
 'Order AYF-100019 by Rose Kerubo has been cancelled. M-Pesa refund initiated.',
 'a1b2c3d4-0019-0000-0000-000000000019', true,
 NOW() - INTERVAL '12 days' + INTERVAL '16 hours 30 minutes'),

('b1c2d3e4-0011-0000-0000-000000000011', 'payment_completed', 'Payment Confirmed',
 'M-Pesa payment of KES 1,350 received for order AYF-100011. Receipt: RFZ6789FGH.',
 'a1b2c3d4-0011-0000-0000-000000000011', true,
 NOW() - INTERVAL '5 days' + INTERVAL '13 hours 17 minutes'),

('b1c2d3e4-0012-0000-0000-000000000012', 'payment_completed', 'Payment Confirmed',
 'M-Pesa payment of KES 1,750 received for order AYF-100014. Receipt: RFZ9012IJK.',
 'a1b2c3d4-0014-0000-0000-000000000014', true,
 NOW() - INTERVAL '10 days' + INTERVAL '9 hours 2 minutes'),

('b1c2d3e4-0013-0000-0000-000000000013', 'payment_failed', 'Payment Issue',
 'M-Pesa STK push for order AYF-100001 (Brian Otieno) is still pending. Manual follow-up may be needed.',
 'a1b2c3d4-0002-0000-0000-000000000002', false,
 NOW() - INTERVAL '1 day' + INTERVAL '12 hours 0 minutes'),

('b1c2d3e4-0014-0000-0000-000000000014', 'new_order', 'New Order Received',
 'Carol Muthoni placed order AYF-100011 for KES 1,350.',
 'a1b2c3d4-0011-0000-0000-000000000011', true,
 NOW() - INTERVAL '5 days' + INTERVAL '13 hours 16 minutes'),

('b1c2d3e4-0015-0000-0000-000000000015', 'new_order', 'New Order Received',
 'Kevin Waweru placed order AYF-100010 for KES 1,050.',
 'a1b2c3d4-0010-0000-0000-000000000010', true,
 NOW() - INTERVAL '5 days' + INTERVAL '11 hours 31 minutes')

ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STORE SETTINGS
-- ============================================================

INSERT INTO public.store_settings (id, store_name, support_email, support_phone, default_delivery_fee, delivery_cities, order_notification_emails)
VALUES (1, 'Ayola Foods KE', 'ayola.foods.kenya@gmail.com', '+254713280550', 150, ARRAY['Nairobi', 'Kiambu'], ARRAY['ayola.foods.kenya@gmail.com'])
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  support_email = EXCLUDED.support_email,
  support_phone = EXCLUDED.support_phone;
