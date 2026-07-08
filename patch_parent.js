const fs = require('fs');
const file = 'src/app/api/auth/register-family/route.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "parent_email: parent.email,",
  "parent_email: parent.email,\n          enrollment_status: 'pending'"
);

fs.writeFileSync(file, content);
