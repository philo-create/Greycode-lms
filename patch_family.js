const fs = require('fs');
const file = 'src/components/FamilyRegistrationForm.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'if (!response.ok) {',
  'if (!response.ok || data.errors?.length > 0) {'
);
content = content.replace(
  'throw new Error(data.error || data.message || \'Registration failed\');',
  'throw new Error(data.error || (data.errors ? data.errors.join(", ") : data.message) || \'Registration failed\');'
);
fs.writeFileSync(file, content);
