const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await client.auth.signUp({
    email: 'test_signup_email_' + Date.now() + '@example.com',
    password: 'password123'
  });
  console.log("Error:", error?.message);
  console.log("Data:", data);
}
run();
