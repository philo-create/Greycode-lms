const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
async function run() {
  const { data: parent } = await supabase.from('profiles').select('*').eq('email', 'mapilam2@gmail.com').maybeSingle();
  console.log("Parent:", parent);
  
  if (parent) {
    const { data: children } = await supabase.from('profiles').select('*').eq('parent_email', parent.email).eq('role', 'learner');
    console.log("Children:", children);
  }
}
run();
