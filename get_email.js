const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  const jamomo = users.users.find(u => u.email && u.email.includes('jamomo'));
  console.log(jamomo ? jamomo.email : 'not found');
}
run();
