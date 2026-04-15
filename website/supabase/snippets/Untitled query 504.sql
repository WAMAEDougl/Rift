UPDATE auth.users 
SET 
  encrypted_password = crypt('12#12#12#Do', gen_salt('bf')),
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'yubbiwamae@gmail.com';
