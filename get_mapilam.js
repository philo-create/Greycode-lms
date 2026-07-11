const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url, key);
async function run() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  const mapilam = users.users.find(u => u.email === 'mapilam2@gmail.com');
  if (mapilam) {
    const { data } = await supabase.from('profiles').select('*').eq('id', mapilam.id).single();
    console.log("Profile role:", data.role);
  }
}
run();
