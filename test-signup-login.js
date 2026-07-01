import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kisuxdgqlsffztkqiomq.supabase.co";
const supabaseKey = "sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: 'realtest12345@yahoo.com',
    password: 'password123',
  });
  console.log("Signup:", error?.message || 'Success');

  const { error: loginErr } = await supabase.auth.signInWithPassword({
    email: 'realtest12345@yahoo.com',
    password: 'password123'
  });
  console.log("Login:", loginErr?.message || 'Success');
}
test();
