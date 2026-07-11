const fs = require('fs');
let content = fs.readFileSync('src/components/LearnerHubView.tsx', 'utf8');

const targetBlock = `        <DashboardCard title="My Badges" className="border-4 border-slate-100 rounded-3xl">
          {data?.recentBadges?.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {/* Maps out badges if they exist */}
            </div>
          ) : (
            <EmptyState 
              title="No badges yet!" 
              description="Keep completing lessons to earn cool badges."
              icon={<Award className="w-16 h-16 text-slate-200" />}
            />
          )}
        </DashboardCard>`;

const newBlock = `        <DashboardCard title="Assignments & Homework" className="border-4 border-slate-100 rounded-3xl overflow-y-auto max-h-[400px]">
          {data?.assignments && data.assignments.length > 0 ? (
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
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{assignment.description}</p>
                  <button className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-sm font-semibold transition-colors">
                    Start Assignment
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No pending homework" 
              description="You're all caught up! Great job!"
              icon={<BookOpen className="w-16 h-16 text-slate-200" />}
            />
          )}
        </DashboardCard>`;

content = content.replace(targetBlock, newBlock);
fs.writeFileSync('src/components/LearnerHubView.tsx', content);
