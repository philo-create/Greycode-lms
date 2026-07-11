const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql_statement: "SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'class_lesson_status'::regclass;" });
  console.log("Error:", error);
}
run();
