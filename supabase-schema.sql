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
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  progress JSONB DEFAULT '{"completedWeeks": {}, "starsEarned": {}, "totalStars": 0, "marksPossible": {}}'::jsonb,
  school_id UUID,
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

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

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
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
