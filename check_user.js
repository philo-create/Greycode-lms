const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const { data: { users }, error } = await client.auth.admin.listUsers();
  if (error) return console.log(error);
  const user = users.find(u => u.email === 'mutshidzi@greycode.co.za');
  if (user) {
    console.log('User found in auth.users:', user.id, user.email, user.user_metadata);
    const { data: profile } = await client.from('profiles').select('*').eq('id', user.id).single();
    console.log('Profile:', profile);
  } else {
    console.log('User not found in auth.users');
  }
}
run();
