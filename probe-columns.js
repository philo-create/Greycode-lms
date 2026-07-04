const url = 'https://kisuxdgqlsffztkqiomq.supabase.co/rest/v1/modules';
const apikey = 'sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX';

const candidates = [
  'id', 'created_at', 'updated_at', 'title', 'name', 'description', 'content',
  'order', 'sequence', 'grade', 'term', 'week', 'lessons', 'lesson', 'status',
  'intro', 'explorer_guide', 'sandbox', 'resources', 'activities', 'type',
  'summary', 'slug', 'image_url', 'icon', 'color', 'school_id', 'class_id'
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
    // Column doesn't exist
    return false;
  } else {
    // Other error, probably column exists but some other issue or permission
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
