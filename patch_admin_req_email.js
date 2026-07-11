const fs = require('fs');
const file = 'src/app/dashboard/admin/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetString = `<td className="py-3 px-4 font-medium text-slate-800">
                            {req.first_name} {req.last_name}
                          </td>`;

const replaceString = `<td className="py-3 px-4 font-medium text-slate-800">
                            {req.first_name} {req.last_name}
                            {req.email && <div className="text-xs font-normal text-slate-500 mt-0.5">{req.email}</div>}
                          </td>`;

code = code.replace(targetString, replaceString);
fs.writeFileSync(file, code);
