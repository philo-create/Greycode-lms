-- SQL Commands to add email confirmation tracking to your Supabase profiles table
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR SUPABASE SQL EDITOR AND RUN IT

-- 1. Add email_confirmed column to public.profiles table if it doesn't already exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;

-- 2. Update existing profiles with their current email confirmation status from auth.users
UPDATE public.profiles p
SET email_confirmed = (u.email_confirmed_at IS NOT NULL)
FROM auth.users u
WHERE p.id = u.id;

-- 3. Create or replace trigger function to handle updates on auth.users (email confirmation)
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email_confirmed = (new.email_confirmed_at IS NOT NULL)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete trigger if it already exists to avoid duplicate/conflict errors
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create the AFTER UPDATE trigger on auth.users to sync email confirmation to public.profiles
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- 4. Update the handle_new_user() trigger function to also set initial email_confirmed status
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    full_name,
    role, 
    school_id, 
    grade, 
    enrollment_status,
    email_confirmed,
    parent_name,
    parent_email,
    parent_phone,
    parent_relationship
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name', 
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      TRIM(CONCAT(new.raw_user_meta_data->>'first_name', ' ', new.raw_user_meta_data->>'last_name'))
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    (new.raw_user_meta_data->>'school_id')::UUID,
    new.raw_user_meta_data->>'grade',
    CASE WHEN COALESCE(new.raw_user_meta_data->>'role', 'student') IN ('student', 'learner') THEN 'pending' ELSE 'approved' END,
    (new.email_confirmed_at IS NOT NULL),
    new.raw_user_meta_data->>'parent_name',
    new.raw_user_meta_data->>'parent_email',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'parent_relationship'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRITICAL: Force Supabase/PostgREST to reload the schema cache so the new column is immediately queryable via client-side JavaScript!
NOTIFY pgrst, 'reload schema';
