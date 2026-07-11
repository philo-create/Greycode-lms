const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const adminClient = createClient(url, adminKey);

async function run() {
  // 1. Get user 
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  const mutshidzi = usersData.users.find(u => u.email === 'mutshidzi@greycode.co.za');
  
  if (!mutshidzi) {
    console.log("No mutshidzi");
    return;
  }
  
  // Create a token for mutshidzi (not directly possible without signin, but let's try something else)
  // Let's just create a test route that doesn't check the token if it fails?
  // Wait, I can't generate a token easily. 
}
run();
