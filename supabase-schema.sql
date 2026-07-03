-- Supabase Schema for Greycode LMS

-- NOTE FOR EXISTING DATABASES:
-- If your app is already live and you are missing student progress columns on your "profiles" table,
-- please copy and paste the following commands into your Supabase SQL Editor and run them:
--
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{"completedWeeks": {}, "starsEarned": {}, "totalStars": 0, "marksPossible": {}}'::jsonb;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 1. Create Profiles Table (Linked to Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin', 'learner', 'school_admin', 'super_admin', 'Super_admin', 'parent', 'facilitator')) DEFAULT 'student',
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  progress JSONB DEFAULT '{"completedWeeks": {}, "starsEarned": {}, "totalStars": 0, "marksPossible": {}}'::jsonb,
  school_id UUID REFERENCES public.schools(id),
  grade TEXT,
  enrollment_status TEXT CHECK (enrollment_status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved',
  parent_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  parent_relationship TEXT,
  email_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Schools Table
CREATE TABLE public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_info TEXT,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Classes Table
CREATE TABLE public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Students_Classes Mapping
CREATE TABLE public.students_classes (
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, class_id)
);

-- 5. Create Modules (Curriculum) Table
CREATE TABLE public.modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grade TEXT NOT NULL,
  term INT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Progress Table (For Learner Tracking)
CREATE TABLE public.progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  score INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, module_id)
);

-- 7. Set up Row Level Security (RLS)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Super admin helper to prevent infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- First check JWT user metadata for speed
  IF COALESCE((auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'Super_admin'), FALSE) THEN
    RETURN TRUE;
  END IF;

  -- Fallback to querying public.profiles table safely (no recursion because policies on profiles won't call this function!)
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    IF v_role IN ('super_admin', 'Super_admin') THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Fallback to querying auth.users table safely bypassing public.profiles RLS
  IF auth.uid() IS NOT NULL THEN
    SELECT COALESCE(raw_user_meta_data->>'role', '') INTO v_role FROM auth.users WHERE id = auth.uid();
    IF v_role IN ('super_admin', 'Super_admin') THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helpers for other roles to ensure robust access even if JWT metadata is stale
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := auth.jwt() -> 'user_metadata' ->> 'role';
  IF v_role IS NOT NULL AND v_role <> '' THEN
    RETURN v_role;
  END IF;
  
  IF auth.uid() IS NOT NULL THEN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    IF v_role IS NOT NULL AND v_role <> '' THEN
      RETURN v_role;
    END IF;
  END IF;

  IF auth.uid() IS NOT NULL THEN
    SELECT COALESCE(raw_user_meta_data->>'role', '') INTO v_role FROM auth.users WHERE id = auth.uid();
    IF v_role IS NOT NULL AND v_role <> '' THEN
      RETURN v_role;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID AS $$
DECLARE
  v_school_id TEXT;
  v_school_uuid UUID;
BEGIN
  v_school_id := auth.jwt() -> 'user_metadata' ->> 'school_id';
  IF v_school_id IS NOT NULL AND v_school_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    RETURN v_school_id::UUID;
  END IF;
  
  IF auth.uid() IS NOT NULL THEN
    SELECT school_id INTO v_school_uuid FROM public.profiles WHERE id = auth.uid();
    IF v_school_uuid IS NOT NULL THEN
      RETURN v_school_uuid;
    END IF;
  END IF;
  
  IF auth.uid() IS NOT NULL THEN
    SELECT raw_user_meta_data->>'school_id' INTO v_school_id FROM auth.users WHERE id = auth.uid();
    IF v_school_id IS NOT NULL AND v_school_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
      RETURN v_school_id::UUID;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read, update, and insert their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Super admin bypass for profiles (Allow super admins to see and update all)
CREATE POLICY "Super admins can do all to profiles"
ON public.profiles FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin'), false)
);

-- School staff can view school profiles
CREATE POLICY "School staff can view school profiles"
ON public.profiles FOR SELECT
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin'), false)
  OR (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
    AND school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID
  )
);

-- School staff can update school profiles
CREATE POLICY "School staff can update school profiles"
ON public.profiles FOR UPDATE
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin'), false)
  OR (
    coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
    AND school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID
  )
);

-- Schools: Anyone can read active schools (for registration)
CREATE POLICY "Anyone can view schools"
ON public.schools FOR SELECT
USING (true);

-- Schools: Super admins can insert/update schools
CREATE POLICY "Super admins can manage schools"
ON public.schools FOR ALL
USING (
  public.is_super_admin()
);


-- Progress: Students can read and update their own progress
CREATE POLICY "Students can view own progress" 
ON public.progress FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Students can update own progress" 
ON public.progress FOR ALL 
USING (auth.uid() = student_id);

-- Modules: Everyone authenticated can read modules
CREATE POLICY "Authenticated users can read modules" 
ON public.modules FOR SELECT 
TO authenticated 
USING (true);

-- Functions & Triggers
-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Automatically track email confirmation updates on auth.users
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email_confirmed = (new.email_confirmed_at IS NOT NULL)
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();
