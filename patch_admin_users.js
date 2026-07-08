const fs = require('fs');
const file = 'src/app/dashboard/admin/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Filter out super_admin users
content = content.replace(
  'const mappedUsers = profiles.map(user => {',
  `const mappedUsers = profiles
          .filter(user => user.role !== 'super_admin')
          .map(user => {`
);

fs.writeFileSync(file, content);
