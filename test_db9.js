const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.example', 'utf8');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: gradePeers } = await supabase
    .from('profiles')
    .select('id, progress')
    .eq('role', 'learner')
    .eq('grade', 'R');
  
  console.log("gradePeers length:", gradePeers?.length);
}
run();
