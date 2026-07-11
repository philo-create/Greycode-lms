const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const mapilam = users.find(u => u.email === 'mapilam2@gmail.com');
  console.log("Mapilam ID:", mapilam?.id);
  if (mapilam) {
    const { data: parent } = await supabase.from('profiles').select('*').eq('id', mapilam.id).single();
    console.log("Parent profile:", parent);
    const { data: children } = await supabase.from('profiles').select('*').eq('parent_email', parent.parent_email).eq('role', 'learner');
    console.log("Children:", children);
  }
}
run();
