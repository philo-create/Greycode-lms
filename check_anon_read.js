const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('class_lesson_status').select('*').eq('school_id', '7bb2d458-e8dc-452e-b428-16d5d60c11f4');
  console.log("Anon Read:", data, error);
}
run();
