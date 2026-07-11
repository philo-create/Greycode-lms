const { createClient } = require('@supabase/supabase-js');
const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabaseUser.from('class_lesson_status').select('*');
  console.log("Anon Read:", data, error);
}
run();
