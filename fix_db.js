const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  await supabase.from('class_lesson_status').upsert({ school_id: '36464ba2-c32d-4881-8994-fda58425a48b', grade: 'R', lesson_id: 'R-T1-W1', status: 'unlocked_for_students', completed_at: '2026-07-06T13:25:17.515+00:00', approved_at: '2026-07-06T13:26:51.312+00:00' }, { onConflict: 'school_id, grade, lesson_id' });
  await supabase.from('class_lesson_status').upsert({ school_id: '36464ba2-c32d-4881-8994-fda58425a48b', grade: 'R', lesson_id: 'R-T1-W2', status: 'teacher_unlocked' }, { onConflict: 'school_id, grade, lesson_id' });
  
  const { data } = await supabase.from('class_lesson_status').select('*');
  console.log("Restored Rows:", data);
}
run();
