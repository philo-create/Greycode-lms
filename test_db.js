const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data: students } = await supabase.from('profiles').select('id, role').eq('role', 'student');
  console.log("Total students in DB:", students?.length);

  const { data: scData } = await supabase.from('students_classes').select('*');
  console.log("students_classes rows:", scData?.length);
  
  const classCounts = {};
  if (scData) {
     scData.forEach(r => {
        classCounts[r.class_id] = (classCounts[r.class_id] || 0) + 1;
     });
  }
  console.log("Class counts:", classCounts);
}
run();
