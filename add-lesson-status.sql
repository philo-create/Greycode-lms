-- Run this in your Supabase SQL Editor

-- Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'Super_admin'), FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() -> 'user_metadata' ->> 'school_id')::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.jwt() -> 'user_metadata' ->> 'role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Create the class_lesson_status table
CREATE TABLE IF NOT EXISTS public.class_lesson_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('locked', 'teacher_unlocked', 'pending_approval', 'unlocked_for_students')) DEFAULT 'locked',
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(school_id, grade, lesson_id)
);

-- 2. Enable RLS
ALTER TABLE public.class_lesson_status ENABLE ROW LEVEL SECURITY;

-- 3. Super admin can do everything
CREATE POLICY "Super admins can manage class_lesson_status"
ON public.class_lesson_status FOR ALL
USING (public.is_super_admin());

-- 4. School staff can view their own school's lesson status
CREATE POLICY "School staff can view class_lesson_status"
ON public.class_lesson_status FOR SELECT
USING (
  public.is_super_admin()
  OR school_id = public.get_user_school_id()
);

-- 5. Teachers can update and insert status for their own school
CREATE POLICY "Teachers can update class_lesson_status"
ON public.class_lesson_status FOR UPDATE
USING (
  public.is_super_admin()
  OR (school_id = public.get_user_school_id() AND public.get_user_role() = 'teacher')
);

CREATE POLICY "Teachers can insert class_lesson_status"
ON public.class_lesson_status FOR INSERT
WITH CHECK (
  public.is_super_admin()
  OR (school_id = public.get_user_school_id() AND public.get_user_role() = 'teacher')
);
