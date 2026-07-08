const fs = require('fs');
const file = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'school_id: meta.school_id || null,',
  'school_id: (meta.school_id && meta.school_id !== "") ? meta.school_id : null,'
);

fs.writeFileSync(file, content);
