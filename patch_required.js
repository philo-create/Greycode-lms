const fs = require('fs');
const file = 'src/components/FamilyRegistrationForm.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add required to parentPhone
content = content.replace(
  '<input\n                type="tel"\n                value={parentPhone}',
  '<input\n                type="tel"\n                required\n                value={parentPhone}'
);

content = content.replace(
  'if (!parentFirstName || !parentLastName || !parentEmail || !parentPassword) {',
  'if (!parentFirstName || !parentLastName || !parentEmail || !parentPassword || !parentPhone) {'
);

fs.writeFileSync(file, content);
