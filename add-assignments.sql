CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    grade VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert for teachers" ON public.assignments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')
  )
);
CREATE POLICY "Enable update for teachers" ON public.assignments FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')
  )
);
CREATE POLICY "Enable delete for teachers" ON public.assignments FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin', 'super_admin', 'school_admin')
  )
);
