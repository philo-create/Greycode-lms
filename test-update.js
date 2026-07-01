import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: users } = await supabase.from('profiles').select('id, enrollment_status').limit(1);
  if (users && users.length > 0) {
    console.log("Found user:", users[0]);
    const { data, error } = await supabase.from('profiles').update({ enrollment_status: 'approved' }).eq('id', users[0].id);
    console.log("Update Error:", error);
  } else {
    console.log("No users found");
  }
}
test();
