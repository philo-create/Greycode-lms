const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles ok?", !error);
  // Is there a way to list tables via supabase JS?
  // We can query information_schema if RLS allows or we use service role? No, information_schema isn't exposed via REST API usually.
}
run();
