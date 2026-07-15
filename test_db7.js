const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, role, grade');
  if (profiles) {
    const learners = profiles.filter(p => p.role === 'learner');
    console.log("Learners:", learners);
  }
}
run();
