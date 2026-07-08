const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(url, key, { auth: { persistSession: true } });
async function test() {
  const email = 'test' + Date.now() + '@example.com';
  console.log("Signing up:", email);
  const { data, error } = await client.auth.signUp({ email, password: 'password123' });
  if (error) return console.log('Signup failed:', error.message);
  
  const token = data.session.access_token;
  console.log("Token:", token.substring(0, 10));
  
  const serverClient = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false }
  });
  
  const { data: user, error: userError } = await serverClient.auth.getUser(token);
  console.log('UserError:', userError?.message);
}
test();
