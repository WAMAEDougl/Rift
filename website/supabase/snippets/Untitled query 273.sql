-- Step 2: Set admin role in profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Admin', 'admin'
FROM auth.users
WHERE email = 'yubbiwamae@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
