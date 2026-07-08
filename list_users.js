const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(url, key);

async function run() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  
  const jabulile = users.find(u => u.email && u.email.toLowerCase().includes('mokete') || u.email && u.email.includes('jabulile'));
  console.log(jabulile ? JSON.stringify(jabulile, null, 2) : "Not found. Let me list some emails:");
  if (!jabulile) {
      console.log(users.map(u => u.email).slice(0, 10));
  }
}

run();
