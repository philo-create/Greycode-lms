const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const payload = { school_id: '7bb2d458-e8dc-452e-b428-16d5d60c11f4', grade: 'R', lesson_id: 'R-T1-W1', status: 'pending_approval' };
  const { error } = await supabase.from('class_lesson_status').upsert(payload, { onConflict: 'school_id, grade, lesson_id' });
  console.log("Upsert 1:", error);
  
  const payload2 = { school_id: '7bb2d458-e8dc-452e-b428-16d5d60c11f4', grade: 'R', lesson_id: 'R-T1-W1', status: 'unlocked_for_students' };
  const { error: error2 } = await supabase.from('class_lesson_status').upsert(payload2, { onConflict: 'school_id, grade, lesson_id' });
  console.log("Upsert 2:", error2);
  
  const { data } = await supabase.from('class_lesson_status').select('*').eq('school_id', '7bb2d458-e8dc-452e-b428-16d5d60c11f4').eq('lesson_id', 'R-T1-W1');
  console.log("Rows:", data);
}
run();
