const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    console.log("No rpc for policies. Let's query pg_policies directly.");
    const { data: pdata, error: perror } = await supabase.from('pg_policies').select('*').limit(1); // Not accessible directly maybe
  }
}
run();
