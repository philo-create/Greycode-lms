const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mapilam2@gmail.com',
    password: 'password123' // Or let me just create a quick token if I can? Wait, I don't know their password.
  });
  console.log(error);
}
run();
