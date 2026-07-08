const fs = require('fs');

function removeTrends(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/trend=\{\{.*?\}\}/g, '');
  fs.writeFileSync(file, content);
}

removeTrends('src/app/dashboard/admin/page.tsx');
removeTrends('src/app/dashboard/school/page.tsx');
