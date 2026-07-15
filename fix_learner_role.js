const fs = require('fs');

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const target = `.eq('role', 'student')`;
  const replacement = `.eq('role', 'learner')`;
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  } else {
    console.log(`Target not found in ${file}`);
  }
}

fixFile('src/app/dashboard/parent/student/[id]/page.tsx');
fixFile('src/app/dashboard/teacher/student/[id]/page.tsx');
