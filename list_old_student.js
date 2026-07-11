const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').eq('school_id', '36464ba2-c32d-4881-8994-fda58425a48b');
  console.log(data);
}
run();
