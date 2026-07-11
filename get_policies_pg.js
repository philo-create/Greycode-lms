const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabaseAdmin.rpc('run_sql', { sql: "SELECT * FROM pg_policies WHERE tablename = 'class_lesson_status'" });
  console.log(data, error);
}
run();
