-- SQL Commands to add subjects and class name columns to your Supabase profiles table
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR SUPABASE SQL EDITOR AND RUN IT

-- 1. Ensure subjects and class_name columns exist on the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subjects TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS class_name TEXT;

-- 2. Update the handle_new_user() trigger function to map these new fields from signup metadata
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
    parent_name,
    parent_email,
    parent_phone,
    parent_relationship,
    subjects,
    class_name
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
    new.raw_user_meta_data->>'parent_name',
    new.raw_user_meta_data->>'parent_email',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'parent_relationship',
    new.raw_user_meta_data->>'subjects',
    new.raw_user_meta_data->>'class_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRITICAL: Force Supabase/PostgREST to reload the schema cache so the new columns are immediately queryable via client-side JavaScript!
NOTIFY pgrst, 'reload schema';
