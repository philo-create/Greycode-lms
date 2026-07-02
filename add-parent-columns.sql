-- SQL Commands to add parent details and missing columns to your Supabase profiles table
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO YOUR SUPABASE SQL EDITOR AND RUN IT

-- 1. Ensure ALL core columns exist on the profiles table (in case of an outdated or incomplete table schema)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'learner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id UUID;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'pending';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{"completedWeeks": {}, "starsEarned": {}, "totalStars": 0, "marksPossible": {}}'::jsonb;

-- 2. Add parent details columns to profiles table if they don't already exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS parent_relationship TEXT;

-- 3. Update the handle_new_user() trigger function to map these parent details from signup metadata
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
    new.raw_user_meta_data->>'parent_name',
    new.raw_user_meta_data->>'parent_email',
    new.raw_user_meta_data->>'parent_phone',
    new.raw_user_meta_data->>'parent_relationship'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Add RLS policy to allow users to insert their own profile (required for client-side upserts)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 5. CRITICAL: Force Supabase/PostgREST to reload the schema cache so the new columns are immediately queryable via client-side JavaScript!
NOTIFY pgrst, 'reload schema';
