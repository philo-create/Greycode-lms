CREATE TABLE public.school_lesson_status (
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  status TEXT CHECK (status IN ('locked', 'teacher_unlocked', 'teacher_prepared', 'student_unlocked')) DEFAULT 'locked',
  prepared_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (school_id, lesson_id)
);

-- RLS
ALTER TABLE public.school_lesson_status ENABLE ROW LEVEL SECURITY;

-- Super admin can do everything
CREATE POLICY "Super admins can manage school_lesson_status"
ON public.school_lesson_status FOR ALL
USING (public.is_super_admin());

-- School staff can view their own school's lesson status
CREATE POLICY "School staff can view school_lesson_status"
ON public.school_lesson_status FOR SELECT
USING (
  public.is_super_admin()
  OR school_id = public.get_user_school_id()
);

-- Teachers can update the status to 'teacher_prepared' for their own school
CREATE POLICY "Teachers can update school_lesson_status"
ON public.school_lesson_status FOR UPDATE
USING (
  public.is_super_admin()
  OR (school_id = public.get_user_school_id() AND public.get_user_role() = 'teacher')
);

CREATE POLICY "Teachers can insert school_lesson_status"
ON public.school_lesson_status FOR INSERT
WITH CHECK (
  public.is_super_admin()
  OR (school_id = public.get_user_school_id() AND public.get_user_role() = 'teacher')
);

