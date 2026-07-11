const fs = require('fs');
const file = 'src/app/dashboard/admin/users/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetString = `<div className="font-medium text-slate-800">{user.first_name} {user.last_name}</div>`;

const replaceString = `<div className="font-medium text-slate-800">{user.first_name} {user.last_name}</div>
                      {user.email && (
                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                      )}`;

code = code.replace(targetString, replaceString);
fs.writeFileSync(file, code);
