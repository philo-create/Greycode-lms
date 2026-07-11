const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'mapilam2@gmail.com', password: 'password123' }); // I don't know the password
}
run();
