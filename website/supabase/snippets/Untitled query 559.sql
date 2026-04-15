-- Check if profiles table exists and has the right structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';
