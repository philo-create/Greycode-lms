const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

async function run() {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
  const relevantUsers = users.users.filter(u => u.email && u.email.includes('jabu'));
  for (const u of relevantUsers) {
    console.log(u.email, u.user_metadata);
  }
}
run();
