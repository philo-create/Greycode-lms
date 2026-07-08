const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const { data: profiles, error } = await client.from('profiles').select('*');
  if (error) return console.log(error);
  
  const blank = profiles.filter(p => !p.first_name || p.first_name.trim() === '');
  console.log('Blank profiles left:', blank.length);
  for (const p of blank) {
    console.log('Deleting hanging profile directly:', p.id);
    await client.from('profiles').delete().eq('id', p.id);
  }
}
run();
