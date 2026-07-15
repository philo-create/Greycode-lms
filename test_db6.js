const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, role, grade');
  if (error) console.error(error);
  console.log("profiles count:", profiles?.length);
  if (profiles) {
    const roles = {};
    const grades = {};
    profiles.forEach(p => {
       roles[p.role] = (roles[p.role] || 0) + 1;
       grades[p.grade] = (grades[p.grade] || 0) + 1;
    });
    console.log("roles:", roles);
    console.log("grades:", grades);
  }
}
run();
