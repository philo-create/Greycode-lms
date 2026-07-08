const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  const { data, error } = await client.auth.admin.createUser({
    email: 'mutshidzi@greycode.co.za',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      first_name: 'Mutshidzi',
      last_name: 'Greycode',
      role: 'super_admin'
    }
  });

  if (error) {
    console.log("Error creating user:", error);
    return;
  }
  
  console.log("Recreated user:", data.user.id);
  
  // Create profile
  const { error: profileError } = await client.from('profiles').upsert({
    id: data.user.id,
    first_name: 'Mutshidzi',
    last_name: 'Greycode',
    full_name: 'Mutshidzi Greycode',
    role: 'super_admin',
    enrollment_status: 'approved'
  });
  
  if (profileError) {
    console.log("Error creating profile:", profileError);
  } else {
    console.log("Profile created");
  }
}
run();
