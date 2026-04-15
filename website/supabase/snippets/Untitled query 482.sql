-- Step 1: Create the auth user
SELECT auth.create_user(
  '{"email": "yubbiwamae@gmail.com", "password": "12#12#12#Do", "email_confirm": true}'::jsonb
);
