UPDATE auth.users 
SET encrypted_password = crypt('12#12#12#Do', gen_salt('bf'))
WHERE email = 'yubbiwamae@gmail.com';
