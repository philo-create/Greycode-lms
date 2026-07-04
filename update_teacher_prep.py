import sys

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'r') as f:
    content = f.read()

# Replace imports to include Dashboard, GradeType, UserProgress
import_target = "import Link from 'next/link';"
import_replacement = """import Link from 'next/link';
import Dashboard from '@/components/Dashboard';
import { GradeType, UserProgress } from '@/types';"""

if import_target in content:
    content = content.replace(import_target, import_replacement)

# Add states for progress and teacherId
state_target = "const [availableGrades, setAvailableGrades] = useState<string[]>([]);"
state_replacement = """const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    completedWeeks: {},
    starsEarned: {},
    totalStars: 0,
    marksPossible: {}
  });
  const [teacherId, setTeacherId] = useState<string>('');"""

if state_target in content:
    content = content.replace(state_target, state_replacement)

# Modify the profile fetch to include id and progress
profile_fetch_target = """        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('grade')
          .eq('id', session.user.id)
          .single();
        if (profileError) throw profileError;"""

profile_fetch_replacement = """        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, grade, progress')
          .eq('id', session.user.id)
          .single();
        if (profileError) throw profileError;
        
        setTeacherId(profileData.id);
        if (profileData.progress) {
          setProgress(profileData.progress as UserProgress);
        }"""

if profile_fetch_target in content:
    content = content.replace(profile_fetch_target, profile_fetch_replacement)

# Add handleUpdateProgress function before if (loading)
update_progress_target = "if (loading) {"
update_progress_replacement = """const handleUpdateProgress = (weekKey: string, starsEarned: number, marksPossible?: number) => {
    setProgress(prev => {
      const previousStarsForWeek = prev.starsEarned[weekKey] || 0;
      const newCompleted = { ...prev.completedWeeks, [weekKey]: true };
      const newStars = { ...prev.starsEarned, [weekKey]: Math.max(previousStarsForWeek, starsEarned) };
      const newPossible = { ...(prev.marksPossible || {}) };
      
      if (marksPossible !== undefined) {
        newPossible[weekKey] = Math.max(newPossible[weekKey] || marksPossible, marksPossible);
      } else if (newPossible[weekKey] === undefined) {
        newPossible[weekKey] = 3;
      }
      
      const newTotal = (Object.values(newStars) as number[]).reduce((sum, current) => sum + current, 0);
      
      const updatedProgress = {
        ...prev,
        completedWeeks: newCompleted,
        starsEarned: newStars,
        totalStars: newTotal,
        marksPossible: newPossible
      };

      if (supabase && teacherId) {
        supabase.from('profiles').update({ progress: updatedProgress }).eq('id', teacherId).then(({ error }) => {
          if (error) console.error('Failed to update teacher progress:', error);
        });
      }

      return updatedProgress;
    });
  };

  if (loading) {"""

if update_progress_target in content:
    content = content.replace(update_progress_target, update_progress_replacement)

# Replace the activeGrade layout
render_target = """        <div className="space-y-6">
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

render_replacement = """        <div className="space-y-6">
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

if render_target in content:
    content = content.replace(render_target, render_replacement)
else:
    print("WARNING: render target not found")

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'w') as f:
    f.write(content)
print("Finished updates.")
