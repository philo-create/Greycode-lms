import re

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'r') as f:
    content = f.read()

# Add imports
imports_target = "import { CURRICULUM_LESSONS } from '@/curriculumData';"
imports_replacement = """import { CURRICULUM_LESSONS } from '@/curriculumData';
import { fetchLessonStatuses } from '@/lib/lesson-status-service';
import { LessonStatus } from '@/types';"""
content = content.replace(imports_target, imports_replacement)

# Add state
state_target = "const [teacherId, setTeacherId] = useState<string>('');"
state_replacement = """const [teacherId, setTeacherId] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [lessonStatuses, setLessonStatuses] = useState<Record<string, LessonStatus>>({});"""
content = content.replace(state_target, state_replacement)

# Update fetch logic
fetch_target = """        // Fetch teacher profile to get assigned grades
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('grade')
          .eq('id', session.user.id)
          .single();"""
fetch_replacement = """        // Fetch teacher profile to get assigned grades and school_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('grade, school_id')
          .eq('id', session.user.id)
          .single();
          
        if (profileData?.school_id) {
          setSchoolId(profileData.school_id);
          const statuses = await fetchLessonStatuses(profileData.school_id);
          setLessonStatuses(statuses);
        }"""
content = content.replace(fetch_target, fetch_replacement)

# Update Dashboard props
dash_target = """<Dashboard 
              activeStudentId={teacherId}
              grade={activeGrade as GradeType}
              progress={progress}
              updateProgress={handleUpdateProgress}
              onExit={() => setActiveGrade(null)}
            />"""
dash_replacement = """<Dashboard 
              activeStudentId={teacherId}
              grade={activeGrade as GradeType}
              progress={progress}
              updateProgress={handleUpdateProgress}
              onExit={() => setActiveGrade(null)}
              schoolId={schoolId}
              lessonStatuses={lessonStatuses}
              setLessonStatuses={setLessonStatuses}
              isTeacherPreparation={true}
            />"""
content = content.replace(dash_target, dash_replacement)

with open('/app/applet/src/app/dashboard/teacher/preparation/page.tsx', 'w') as f:
    f.write(content)
print("Updated page.tsx")
