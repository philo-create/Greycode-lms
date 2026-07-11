const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_policies', {}); // or just query the constraint
  // let's just run an insert that conflicts and see the error
}
run();
