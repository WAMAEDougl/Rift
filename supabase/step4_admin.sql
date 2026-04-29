-- ============================================================
-- STEP 4: Create admin user account
-- Run this AFTER creating the user via Supabase Auth dashboard
-- OR use the SQL below to insert directly into auth.users
-- ============================================================

-- OPTION A (Recommended): 
-- 1. Go to Supabase → Authentication → Users → "Add user"
-- 2. Email: admin@ayolafoods.co.ke  Password: Admin@Ayola2024!
-- 3. Then run ONLY the UPDATE below to set the role:

UPDATE public.profiles
SET role = 'admin', full_name = 'Admin'
WHERE email = 'admin@ayolafoods.co.ke';

-- Kitchen staff account (create via Auth dashboard first):
-- Email: kitchen@ayolafoods.co.ke  Password: Kitchen@Ayola2024!
UPDATE public.profiles
SET role = 'kitchen', full_name = 'Kitchen Staff'
WHERE email = 'kitchen@ayolafoods.co.ke';


-- ============================================================
-- OPTION B: Direct insert (only if Option A doesn't work)
-- This bypasses the normal auth flow — use with caution
-- ============================================================

-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
-- VALUES (
--   uuid_generate_v4(),
--   'admin@ayolafoods.co.ke',
--   crypt('Admin@Ayola2024!', gen_salt('bf')),
--   now(),
--   'authenticated',
--   'authenticated'
-- );
