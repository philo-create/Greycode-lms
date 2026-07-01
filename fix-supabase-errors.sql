-- Run this entire script in your Supabase SQL Editor

-- 1. Fix the "public.learners does not exist" error
-- This drops any leftover triggers from the old schema that are trying to update the deleted learners table
DROP TRIGGER IF EXISTS sync_learner_trigger ON public.profiles;
DROP FUNCTION IF EXISTS public.sync_learner() CASCADE;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_updated_profile() CASCADE;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_updated_user() CASCADE;


-- 2. Fix the "violates foreign key constraint" error when deleting a user from auth.users
-- This drops the existing foreign key constraint and replaces it with one that has ON DELETE CASCADE
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Also fix other tables that might reference profiles and prevent deletion
ALTER TABLE public.students_classes
DROP CONSTRAINT IF EXISTS students_classes_student_id_fkey;

ALTER TABLE public.students_classes
ADD CONSTRAINT students_classes_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

ALTER TABLE public.progress
DROP CONSTRAINT IF EXISTS progress_student_id_fkey;

ALTER TABLE public.progress
ADD CONSTRAINT progress_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
