const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url, key);
async function run() {
  const { data } = await supabase.from('profiles').select('email, role').in('role', ['admin', 'super_admin', 'superadmin', 'school_admin']);
  console.log(data);
}
run();
