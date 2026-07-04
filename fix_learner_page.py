import re

with open('/app/applet/src/app/dashboard/learner/page.tsx', 'r') as f:
    content = f.read()

# Add imports
imports_target = "import Dashboard from '@/components/Dashboard';"
imports_replacement = """import Dashboard from '@/components/Dashboard';
import { fetchLessonStatuses } from '@/lib/lesson-status-service';
import { LessonStatus } from '@/types';"""
content = content.replace(imports_target, imports_replacement)

# Add state
state_target = "const [profile, setProfile] = useState<any>(null);"
state_replacement = """const [profile, setProfile] = useState<any>(null);
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});"""
content = content.replace(state_target, state_replacement)

# Update fetch logic
fetch_target = """        if (profileError) throw profileError;
        setProfile(profileData);
        setProgress(profileData.progress || {"""
fetch_replacement = """        if (profileError) throw profileError;
        setProfile(profileData);
        setProgress(profileData.progress || {
          completedWeeks: {},
          starsEarned: {},
          totalStars: 0,
          marksPossible: {}
        });
        
        if (profileData.school_id) {
          const statuses = await fetchLessonStatuses(profileData.school_id);
          setLessonStatuses(statuses);
        }"""
content = content.replace(fetch_target, fetch_replacement)

# Update Dashboard props
dash_target = """<Dashboard 
            activeStudentId={session?.user?.id}
            grade={profile.grade as GradeType}
            progress={progress}
            updateProgress={handleUpdateProgress}
            onExit={() => setActiveView('map')}
          />"""
dash_replacement = """<Dashboard 
            activeStudentId={session?.user?.id}
            grade={profile.grade as GradeType}
            progress={progress}
            updateProgress={handleUpdateProgress}
            onExit={() => setActiveView('map')}
            schoolId={profile.school_id}
            lessonStatuses={lessonStatuses}
            isTeacherPreparation={false}
          />"""
content = content.replace(dash_target, dash_replacement)

with open('/app/applet/src/app/dashboard/learner/page.tsx', 'w') as f:
    f.write(content)
print("Updated learner page")
