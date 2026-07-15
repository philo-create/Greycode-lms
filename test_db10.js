const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.example', 'utf8');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, role, grade');
  
  console.log("All profiles:", profiles);
}
run();
