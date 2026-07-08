const fs = require('fs');
const file = 'src/components/LoginGate.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'school_id: selectedSchool,',
  'school_id: selectedSchool || null,'
);

fs.writeFileSync(file, content);
