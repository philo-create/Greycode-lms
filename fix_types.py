import re

with open('/app/applet/src/types.ts', 'r') as f:
    content = f.read()

# Replace LessonStatus definition
target = "export type LessonStatus = 'locked' | 'teacher_unlocked' | 'teacher_prepared' | 'student_unlocked';"
replacement = "export type LessonStatus = 'locked' | 'teacher_unlocked' | 'pending_approval' | 'unlocked_for_students';"
content = content.replace(target, replacement)

# Replace SchoolLessonStatus with ClassLessonStatus
target_interface = """export interface SchoolLessonStatus {
  school_id: string;
  lesson_id: string;
  status: LessonStatus;
  prepared_by?: string;
  updated_at?: string;
}"""
replacement_interface = """export interface ClassLessonStatus {
  id: string;
  school_id: string;
  teacher_id: string;
  grade: string;
  lesson_id: string;
  status: LessonStatus;
  completed_at?: string;
  approved_at?: string;
}"""
content = content.replace(target_interface, replacement_interface)

with open('/app/applet/src/types.ts', 'w') as f:
    f.write(content)
print("Updated types")
