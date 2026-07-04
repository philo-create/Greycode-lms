import sys

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'r') as f:
    content = f.read()

target = """        <div className="space-y-6">
          <button 
            onClick={() => setActiveGrade(null)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Grades</span>
          </button>
          
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-6">
            <span className="w-10 h-10 bg-indigo-100 text-indigo-700 font-black rounded-xl flex items-center justify-center text-lg">
              {activeGrade}
            </span>
            <h2 className="text-xl font-bold text-slate-800">Grade {activeGrade} Curriculum</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGradeLessons.length > 0 ? (
              activeGradeLessons.map((lesson) => (
                <DashboardCard key={lesson.id} noPadding>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <BookText className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        Week {lesson.week}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{lesson.title}</h3>
                    <div className="flex items-center text-slate-500 text-sm mb-6 gap-4">
                      <div className="flex items-center">
                        <Book className="w-4 h-4 mr-1.5" />
                        <span>Term {lesson.term}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        lesson.strand === 'Coding' ? 'bg-sky-50 text-sky-600' :
                        lesson.strand === 'Robotics' ? 'bg-rose-50 text-rose-600' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {lesson.strand}
                      </span>
                    </div>
                    {lesson.description && (
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">{lesson.description}</p>
                    )}
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                    <Link 
                      href={`/dashboard/teacher/preparation/${lesson.id}`}
                      className="w-full flex items-center justify-between text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                    >
                      <span>View Lesson</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </DashboardCard>
              ))
            ) : (
              <div className="col-span-full">
                <DashboardCard>
                  <EmptyState 
                    title="No Lessons Available"
                    description={`There are currently no lessons available for Grade ${activeGrade}.`}
                    icon={<BookOpen className="w-12 h-12 text-slate-300" />}
                  />
                </DashboardCard>
              </div>
            )}
          </div>
        </div>"""

replacement = """        <div className="space-y-6">
          <button 
            onClick={() => setActiveGrade(null)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Grades</span>
          </button>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <Dashboard 
              activeStudentId={teacherId}
              grade={activeGrade as GradeType}
              progress={progress}
              updateProgress={handleUpdateProgress}
              onExit={() => setActiveGrade(null)}
            />
          </div>
        </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target not found. Looking for chunks...")

