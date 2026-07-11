const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

async function run() {
  const { data, error } = await supabaseAdmin.from('class_lesson_status').select('*').limit(1); // just to check if table exists
  console.log(data);
  // How to get policies?
  const { data: pData, error: pError } = await supabaseAdmin.rpc('get_policies_raw');
  console.log("RPC:", pData, pError);
}
run();
