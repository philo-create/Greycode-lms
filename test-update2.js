import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kisuxdgqlsffztkqiomq.supabase.co";
const supabaseKey = "sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users, error: fetchErr } = await supabase.from('profiles').select('*').limit(1);
  if (fetchErr) {
    console.log("Fetch error:", fetchErr);
    return;
  }
  
  if (users && users.length > 0) {
    console.log("Found user:", users[0]);
    const { data, error } = await supabase.from('profiles').update({ enrollment_status: 'approved' }).eq('id', users[0].id);
    console.log("Update Error:", error);
  } else {
    console.log("No users found");
  }
}
test();
