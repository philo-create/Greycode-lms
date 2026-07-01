import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kisuxdgqlsffztkqiomq.supabase.co";
const supabaseKey = "sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dakalo@yahoo.com',
    password: 'wrongpassword123'
  });
  console.log("Login result:", error?.message || 'Success');
}
test();
