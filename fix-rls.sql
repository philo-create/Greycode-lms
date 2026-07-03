-- Run this in your Supabase SQL Editor
-- This ensures super admins and school admins have full access to update profiles without RLS issues

-- 1. Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can do all to profiles" ON public.profiles;
DROP POLICY IF EXISTS "School staff can view school profiles" ON public.profiles;
DROP POLICY IF EXISTS "School staff can update school profiles" ON public.profiles;

-- 2. Recreate policies with safe auth.jwt() checks
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Super admins can do EVERYTHING
CREATE POLICY "Super admins can do all to profiles"
ON public.profiles FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin', 'admin'), false)
)
WITH CHECK (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin', 'admin'), false)
);

-- School admins can view their school's profiles
CREATE POLICY "School staff can view school profiles"
ON public.profiles FOR SELECT
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
  AND school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID
);

-- School admins can update their school's profiles
CREATE POLICY "School staff can update school profiles"
ON public.profiles FOR UPDATE
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
  AND school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID
)
WITH CHECK (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
  AND school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID
);

-- School admins can delete profiles in their own school
CREATE POLICY "School admins can delete school profiles"
ON public.profiles FOR DELETE
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin'), false)
  AND school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID
);

-- 3. Comprehensive policies for progress, classes, and students_classes
-- Drop existing policies first
DROP POLICY IF EXISTS "Super admins can do all to progress" ON public.progress;
DROP POLICY IF EXISTS "School staff can manage progress" ON public.progress;
DROP POLICY IF EXISTS "Super admins can manage classes" ON public.classes;
DROP POLICY IF EXISTS "School staff can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Anyone authenticated can view classes" ON public.classes;
DROP POLICY IF EXISTS "Super admins can manage students_classes" ON public.students_classes;
DROP POLICY IF EXISTS "School staff can manage students_classes" ON public.students_classes;
DROP POLICY IF EXISTS "Anyone authenticated can view students_classes" ON public.students_classes;

-- Progress Policies for Admin and Staff
CREATE POLICY "Super admins can do all to progress"
ON public.progress FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin', 'admin'), false)
);

CREATE POLICY "School staff can manage progress"
ON public.progress FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
);

-- Classes Policies
CREATE POLICY "Anyone authenticated can view classes"
ON public.classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage classes"
ON public.classes FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin', 'admin'), false)
);

CREATE POLICY "School staff can manage classes"
ON public.classes FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
  AND (school_id = (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID OR school_id IS NULL)
);

-- Students Classes Mapping Policies
CREATE POLICY "Anyone authenticated can view students_classes"
ON public.students_classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can manage students_classes"
ON public.students_classes FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin', 'Super_admin', 'admin'), false)
);

CREATE POLICY "School staff can manage students_classes"
ON public.students_classes FOR ALL
USING (
  coalesce((auth.jwt() -> 'user_metadata' ->> 'role') in ('school_admin', 'teacher', 'facilitator'), false)
);

-- Note: Also ensure enrollment_status column exists and check constraint is correct
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enrollment_status TEXT DEFAULT 'pending';

-- Drop the check constraint just in case it's causing issues with unexpected values
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_enrollment_status_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS enrollment_status_check;

-- Drop role check constraint just in case it's causing issues
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
