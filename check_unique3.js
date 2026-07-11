const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.from('class_lesson_status').upsert({ school_id: '7bb2d458-e8dc-452e-b428-16d5d60c11f4', grade: 'R', lesson_id: 'R-T1-W3', status: 'pending_approval' }, { onConflict: 'school_id, grade, lesson_id' }).select('*');
  console.log("Upsert 3:", data, error);
  const { data: all } = await supabase.from('class_lesson_status').select('*').eq('school_id', '7bb2d458-e8dc-452e-b428-16d5d60c11f4');
  console.log("All:", all.length);
}
run();
