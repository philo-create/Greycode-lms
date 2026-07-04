import re

with open('/app/applet/src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

props_target = """export default function Dashboard({ 
  activeStudentId, 
  grade, 
  progress, 
  updateProgress, 
  onExit 
}: { 
  activeStudentId?: string; 
  grade: GradeType; 
  progress: UserProgress; 
  updateProgress: (weekKey: string, stars: number, marksPossible?: number) => void;
  onExit: () => void;
}) {"""
props_replacement = """import { LessonStatus } from '@/types';
import { updateLessonStatus } from '@/lib/lesson-status-service';

export default function Dashboard({ 
  activeStudentId, 
  grade, 
  progress, 
  updateProgress, 
  onExit,
  schoolId,
  lessonStatuses = {},
  setLessonStatuses,
  isTeacherPreparation = false
}: { 
  activeStudentId?: string; 
  grade: GradeType; 
  progress: UserProgress; 
  updateProgress: (weekKey: string, stars: number, marksPossible?: number) => void;
  onExit: () => void;
  schoolId?: string;
  lessonStatuses?: Record<string, LessonStatus>;
  setLessonStatuses?: React.Dispatch<React.SetStateAction<Record<string, LessonStatus>>>;
  isTeacherPreparation?: boolean;
}) {"""
content = content.replace(props_target, props_replacement)

with open('/app/applet/src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
print("Updated Dashboard props")
