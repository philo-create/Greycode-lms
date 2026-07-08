const fs = require('fs');
const file = 'src/app/dashboard/admin/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<table className="w-full text-left border-collapse">',
  '<table className="w-full min-w-[900px] text-left border-collapse">'
);

fs.writeFileSync(file, content);
