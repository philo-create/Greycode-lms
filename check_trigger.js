const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_function_definition', { func_name: 'handle_new_user' });
  console.log(data);
}
run();
