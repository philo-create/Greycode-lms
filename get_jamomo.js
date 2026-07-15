const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jzgfcimyv4ecz6573a2g3u.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('No URL or Key');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', '3f200e15-060f-45ce-a104-dc601dd9dde8').single();
  console.log(JSON.stringify(profile.progress.subjectGrades, null, 2));
}
run();
