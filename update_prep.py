import sys

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'r') as f:
    content = f.read()

target = """                  <div 
                    key={grade} 
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group" 
                    onClick={() => setActiveGrade(grade)}
                  >"""

replacement = """                  <div 
                    key={grade} 
                    role="button"
                    tabIndex={0}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group active:scale-95" 
                    onClick={() => setActiveGrade(grade)}
                    onKeyDown={(e) => e.key === 'Enter' && setActiveGrade(grade)}
                  >"""

if target in content:
    with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'w') as f:
        f.write(content.replace(target, replacement))
    print("Replaced successfully")
else:
    print("Target not found")
