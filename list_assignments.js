const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const adminClient = createClient(url, key);

async function run() {
  const { data, error } = await adminClient.from('assignments').select('*');
  console.log(data);
}
run();
