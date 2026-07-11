const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const teachers = users.filter(u => u.email === 'mapilam2@gmail.com' || u.email === 'mutshidzi@greycode.co.za' || true); // we just need A teacher
  const { data: teacherProfiles } = await supabase.from('profiles').select('*').eq('role', 'teacher');
  console.log("Teachers:", teacherProfiles);
}
run();
