const url = 'https://kisuxdgqlsffztkqiomq.supabase.co/rest/v1/modules';
const apikey = 'sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX';

const candidates = [
  'week', 'weeks', 'lessons', 'lesson_content', 'metadata', 'content',
  'intro_content', 'explorer_content', 'sandbox_content',
  'intro', 'explorer', 'sandbox', 'activity', 'activities',
  'is_published', 'published', 'order_index', 'index', 'position',
  'curriculum', 'grade_id', 'term_id', 'school_id'
];

async function checkColumn(col) {
  const res = await fetch(`${url}?select=${col}`, {
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`
    }
  });
  const data = await res.json();
  if (res.status === 200) {
    console.log(`Column exists: ${col}`);
    return true;
  } else if (data.message && data.message.includes('does not exist')) {
    return false;
  } else {
    console.log(`Column probably exists: ${col} (status ${res.status}, error: ${data.message})`);
    return true;
  }
}

async function main() {
  for (const col of candidates) {
    await checkColumn(col);
  }
}

main();
