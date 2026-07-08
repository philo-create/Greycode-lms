const fs = require('fs');
const file = 'src/components/dashboard/StatCard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col"',
  'className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-1"'
);

fs.writeFileSync(file, content);
