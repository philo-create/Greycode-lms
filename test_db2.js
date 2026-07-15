const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
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
