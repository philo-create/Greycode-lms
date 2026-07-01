import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// using the URL and anon key from env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey; // If service role key is available

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reset() {
  // Wait, I can't query auth.users from anon key without service_role key, or I might need to just query public.profiles if the email is there? Wait, public.profiles doesn't have email.
  // Wait, does the project have SUPABASE_SERVICE_ROLE_KEY?
  console.log("Using URL:", supabaseUrl);
}

reset();
