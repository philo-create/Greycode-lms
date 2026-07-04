const url = 'https://kisuxdgqlsffztkqiomq.supabase.co/rest/v1';
const apikey = 'sb_publishable_XV5OCoP9_XQts1DpSOUvIg_v7LtxlAX';

const baseNames = [
  'lesson', 'lessons', 'module', 'modules', 'week', 'weeks', 'term', 'terms',
  'class', 'classes', 'school', 'schools', 'profile', 'profiles',
  'teacher', 'teachers', 'student', 'students', 'grade', 'grades',
  'curriculum', 'curriculums', 'workbook', 'workbooks', 'progress',
  'activity', 'activities', 'content', 'contents', 'slide', 'slides',
  'exercise', 'exercises', 'question', 'questions', 'quiz', 'quizzes',
  'step', 'steps', 'topic', 'topics', 'subject', 'subjects', 'unit', 'units',
  'course', 'courses', 'resource', 'resources', 'assignment', 'assignments',
  'schedule', 'schedules', 'session', 'sessions', 'material', 'materials',
  'workbook_page', 'workbook_pages', 'page', 'pages'
];

const prefixes = ['', 'lesson_', 'curriculum_', 'workbook_', 'grade_r_', 'grade_1_', 'grade_2_'];
const suffixes = ['', '_data', '_db', '_table', '_list', '_mapping', '_metadata', '_info', '_content', '_contents', '_progress', '_unlock_audit'];

const candidates = new Set();
for (const base of baseNames) {
  for (const pre of prefixes) {
    for (const suf of suffixes) {
      candidates.add(`${pre}${base}${suf}`);
    }
  }
}

// Add some custom ones
const extra = [
  'lesson_unlock_audit', 'lesson_progress', 'user_lessons', 'student_lessons',
  'classes', 'schools', 'profiles', 'modules', 'progress'
];
for (const e of extra) {
  candidates.add(e);
}

const list = Array.from(candidates);
console.log(`Probing ${list.length} candidate tables...`);

async function probe(table) {
  try {
    const res = await fetch(`${url}/${table}`, {
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`
      }
    });
    if (res.status === 200 || res.status === 201 || res.status === 204 || res.status === 406) {
      console.log(`Found: ${table} (status ${res.status})`);
      return table;
    }
  } catch (err) {
    // Ignore
  }
  return null;
}

async function main() {
  const found = [];
  // Run probes in chunks of 20 to avoid rate limiting or too many open sockets
  const chunkSize = 20;
  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(probe));
    for (const r of results) {
      if (r) found.push(r);
    }
  }
  console.log("Finished! All found tables:", found);
}

main();
