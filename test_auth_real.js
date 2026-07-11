const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
const supabaseUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: newUser, error: err1 } = await supabaseAdmin.auth.admin.createUser({
    email: 'testlearner123@example.com',
    password: 'password123',
    email_confirm: true
  });
  console.log("Created user:", err1 ? err1.message : "Success");
  
  if (!err1) {
    await supabaseAdmin.from('profiles').update({ role: 'learner', school_id: '7bb2d458-e8dc-452e-b428-16d5d60c11f4', grade: 'R' }).eq('id', newUser.user.id);
  }

  const { data: authData, error: authError } = await supabaseUser.auth.signInWithPassword({ email: 'testlearner123@example.com', password: 'password123' }); 
  console.log("Auth:", authError ? authError.message : "Success");
  
  const { data, error } = await supabaseUser.from('class_lesson_status').select('*').eq('school_id', '7bb2d458-e8dc-452e-b428-16d5d60c11f4');
  console.log("Read:", data, error);
  
  await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
}
run();
