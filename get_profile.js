const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', 'e7036a42-b178-4006-941a-39f3749a7769');
  console.log(data);
}
run();
