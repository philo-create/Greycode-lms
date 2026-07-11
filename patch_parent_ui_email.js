const fs = require('fs');
const file = 'src/app/dashboard/parent/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const targetString = `                        <p className="text-sm text-slate-500">
                          {child.classes?.class_name ? \`Class \${child.classes.class_name}\` : \`Grade \${child.grade}\`}
                        </p>`;

const replaceString = `                        <p className="text-sm text-slate-500">
                          {child.classes?.class_name ? \`Class \${child.classes.class_name}\` : \`Grade \${child.grade}\`}
                        </p>
                        {child.profiles?.email && (
                          <p className="text-xs text-indigo-600 font-medium mt-1">
                            {child.profiles.email}
                          </p>
                        )}`;

code = code.replace(targetString, replaceString);
fs.writeFileSync(file, code);
