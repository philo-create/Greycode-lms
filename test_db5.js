const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: students, error } = await supabase.from('profiles').select('id, first_name, last_name, grade, role').eq('role', 'student');
  if (error) console.error(error);
  console.log("students count:", students?.length);
  if (students) {
    const grades = {};
    students.forEach(s => {
       grades[s.grade] = (grades[s.grade] || 0) + 1;
    });
    console.log("grades:", grades);
  }
}
run();
