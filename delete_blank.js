const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const { data: profiles, error } = await client.from('profiles').select('*').is('first_name', null);
  if (error) return console.log(error);
  
  console.log('Blank profiles:', profiles.length);
  for (const p of profiles) {
    console.log('Deleting profile:', p.id);
    await client.auth.admin.deleteUser(p.id);
    // Deleting from auth.users should cascade to profiles
  }
}
run();
