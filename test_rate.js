const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const ts = Date.now();
  console.log("Signup 1");
  const r1 = await client.auth.signUp({ email: 'diff1' + ts + '@example.com', password: 'password123' });
  console.log(r1.error?.message);
  
  console.log("Signup 2");
  const r2 = await client.auth.signUp({ email: 'diff2' + ts + '@example.com', password: 'password123' });
  console.log(r2.error?.message);
}
run();
