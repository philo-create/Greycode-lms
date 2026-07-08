const fs = require('fs');
const file = 'src/app/dashboard/admin/users/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '<td className="py-3 px-4 text-sm text-slate-600">\n                      {user.role === \'teacher\' ? (\n                        <div className="flex flex-wrap gap-1 max-w-[200px]" id={`teacher-grades-${user.id}`}>';
const replace = '<td className="py-3 px-4 text-sm text-slate-600 min-w-[200px]">\n                      {user.role === \'teacher\' ? (\n                        <div className="flex flex-wrap gap-1 w-full max-w-[250px]" id={`teacher-grades-${user.id}`}>';

content = content.replace(target, replace);
fs.writeFileSync(file, content);
