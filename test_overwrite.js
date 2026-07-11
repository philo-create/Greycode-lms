const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  await supabase.from('class_lesson_status').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // clear table for testing
  
  await supabase.from('class_lesson_status').upsert({ school_id: '7bb2d458-e8dc-452e-b428-16d5d60c11f4', grade: 'R', lesson_id: 'R-T1-W1', status: 'unlocked_for_students' }, { onConflict: 'school_id, grade, lesson_id' });
  
  await supabase.from('class_lesson_status').upsert({ school_id: '7bb2d458-e8dc-452e-b428-16d5d60c11f4', grade: 'R', lesson_id: 'R-T1-W2', status: 'teacher_unlocked' }, { onConflict: 'school_id, grade, lesson_id' });
  
  const { data } = await supabase.from('class_lesson_status').select('*');
  console.log("Rows:", data);
}
run();
