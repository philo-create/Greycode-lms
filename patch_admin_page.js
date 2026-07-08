const fs = require('fs');
const file = 'src/app/dashboard/admin/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '  if (error) {',
  '  if (!data || !data.stats) { return <DashboardLayout role="admin"><div className="p-4">Failed to load data</div></DashboardLayout>; }\n\n  if (error) {'
);

fs.writeFileSync(file, content);
