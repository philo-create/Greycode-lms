const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: 'CREATE TABLE IF NOT EXISTS test_tb(id int);' });
  console.log(error || 'Success');
}
run();
