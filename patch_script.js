const fs = require('fs');
const content = fs.readFileSync('src/components/MainApp.tsx', 'utf8');

const targetStr = `            {/* Select Grade Nav Group */}
            <nav className="space-y-1 mb-8">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Select Grade</p>
              
              {/* Active / Current Grade Indicator */}`;

const newStr = `            {/* Select Grade Nav Group (Hidden for Learners) */}
            {activeStudent?.role !== 'learner' && (
            <nav className="space-y-1 mb-8">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-3 select-none">Select Grade</p>
              
              {/* Active / Current Grade Indicator */}`;

const targetStr2 = `                  );
                })}
              </div>
            </nav>

            {/* Learning View and static guides */}`;

const newStr2 = `                  );
                })}
              </div>
            </nav>
            )}

            {/* Learning View and static guides */}`;

let newContent = content.replace(targetStr, newStr);
newContent = newContent.replace(targetStr2, newStr2);
fs.writeFileSync('src/components/MainApp.tsx', newContent);
