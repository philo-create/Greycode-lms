import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const schoolId = '7bb2d458-e8dc-452e-b428-16d5d60c11f4';
  const grade = 'R';
  let query = supabase
      .from('class_lesson_status')
      .select('lesson_id, status')
      .eq('school_id', schoolId);
      
  if (grade) {
    query = query.eq('grade', grade);
  }
  const { data, error } = await query;
  console.log(data, error);
}
run();
