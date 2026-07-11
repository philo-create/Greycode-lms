const fs = require('fs');
const file = 'src/app/dashboard/parent/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Insert assignments card
const targetString = `          <DashboardCard title="Recent Learning Activity">`;

const replaceString = `          <DashboardCard title="Assignments & Homework">
            {data.assignments && data.assignments.length > 0 ? (
              <div className="space-y-4">
                {data.assignments.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wider">
                        {assignment.subject}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1">{assignment.title}</h4>
                    <p className="text-sm text-slate-600 line-clamp-2">{assignment.description}</p>
                    <div className="mt-3 text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded">
                      Grade {assignment.grade}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                 title="No Assignments" 
                 description="No pending homework or assignments for your children."
                 icon={<BookOpen className="w-12 h-12 text-slate-300" />}
              />
            )}
          </DashboardCard>

          <DashboardCard title="Recent Learning Activity">`;

code = code.replace(targetString, replaceString);
fs.writeFileSync(file, code);
