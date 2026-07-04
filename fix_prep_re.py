import sys
import re

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'r') as f:
    content = f.read()

# Replace the specific div that contains the active grade view
pattern = r'<div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-6">.*?</div>\s*</div>\s*\)\}\s*</DashboardLayout>'

replacement = """<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <Dashboard 
              activeStudentId={teacherId}
              grade={activeGrade as GradeType}
              progress={progress}
              updateProgress={handleUpdateProgress}
              onExit={() => setActiveGrade(null)}
            />
          </div>
        </div>
      )}
    </DashboardLayout>"""

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content != content:
    with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Target not found.")

