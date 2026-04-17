-- Fix GoTrue schema permissions
GRANT USAGE ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin;

-- Also ensure the authenticator role has access
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT SELECT ON public.profiles TO authenticator;
