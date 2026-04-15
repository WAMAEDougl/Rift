-- Check triggers on auth.users
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';
