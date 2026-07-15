const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: students } = await supabase.from('profiles').select('id, first_name, last_name, grade').eq('role', 'student');
  console.log("students:", students);
}
run();
