const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.from('students_classes').select('*, classes(grade)').eq('student_id', '3f200e15-060f-45ce-a104-dc601dd9dde8');
  console.log(data);
}
run();
