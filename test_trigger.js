const { createClient } = require('@supabase/supabase-js');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function run() {
  console.log("Signup a parent");
  const ts = Date.now();
  const parent = {
      email: 'parent' + ts + '@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Bob',
          last_name: 'Parent',
          role: 'parent',
          parent_phone: '123456789',
          parent_email: 'parent' + ts + '@example.com',
        }
      }
  };
  const r1 = await client.auth.signUp(parent);
  if (r1.error) {
    console.log("Signup error:", r1.error);
    return;
  }
  
  const parentId = r1.data.user.id;
  const p1 = await client.from('profiles').select('*').eq('id', parentId).single();
  console.log("Parent profile:", p1.data, p1.error);
  
  const child = {
      email: 'child' + ts + '@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Timmy',
          last_name: 'Child',
          school_id: null,
          grade: '1',
          role: 'learner',
          enrollment_status: 'pending',
          parent_name: 'Bob Parent',
          parent_email: parent.email,
          parent_phone: '123456789',
          parent_relationship: 'Parent'
        }
      }
  };
  const r2 = await client.auth.signUp(child);
  if (r2.error) {
    console.log("Child signup error:", r2.error);
    return;
  }
  const childId = r2.data.user.id;
  const p2 = await client.from('profiles').select('*').eq('id', childId).single();
  console.log("Child profile:", p2.data, p2.error);
}
run();
