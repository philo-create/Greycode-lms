import re

with open('/app/applet/src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Update props to accept teacherId
props_target = """export default function Dashboard({ 
  activeStudentId, """
props_replacement = """export default function Dashboard({ 
  activeStudentId, 
  teacherId,"""
content = content.replace(props_target, props_replacement)

props_type_target = """}: { 
  activeStudentId?: string; """
props_type_replacement = """}: { 
  activeStudentId?: string; 
  teacherId?: string;"""
content = content.replace(props_type_target, props_type_replacement)


# 2. Update `checkIsLessonLocked`
lock_target = """  const checkIsLessonLocked = (lessonId: string) => {
    if (superAdminBypass) return false;
    
    // If we have no lesson statuses loaded, fallback to legacy behavior (allow opening, lock only in immersive mode)
    if (Object.keys(lessonStatuses || {}).length === 0) {
      return false; 
    }

    const lessonStatus = (lessonStatuses || {})[lessonId];
    
    if (isTeacherPreparation) {
      // Teacher can open if it's not 'locked'
      // Default T1 W1 to unlocked if no status exists
      const lesson = lessonsForGrade.find(l => l.id === lessonId);
      if (lesson && lesson.term === 1 && lesson.week === 1 && !lessonStatus) {
        return false;
      }
      return !lessonStatus || lessonStatus === 'locked';
    } else {
      // Student can open only if 'student_unlocked'
      return lessonStatus !== 'student_unlocked';
    }
  };"""

lock_replacement = """  const getLessonStatus = (lessonId: string) => {
    const lessonStatus = (lessonStatuses || {})[lessonId];
    
    if (isTeacherPreparation) {
      const lesson = lessonsForGrade.find(l => l.id === lessonId);
      if (lesson && lesson.term === 1 && lesson.week === 1 && !lessonStatus) {
        return 'teacher_unlocked';
      }
      return lessonStatus || 'locked';
    } else {
      return lessonStatus || 'locked';
    }
  };

  const checkIsLessonLocked = (lessonId: string) => {
    if (superAdminBypass) return false;
    const status = getLessonStatus(lessonId);
    
    if (isTeacherPreparation) {
      return status === 'locked' || status === 'pending_approval'; // teachers can't open locked or pending
    } else {
      return status !== 'unlocked_for_students';
    }
  };"""
content = content.replace(lock_target, lock_replacement)

# 3. Update the visual display in termLessons mapping
render_target = """                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer selection:bg-transparent ${checkIsLessonLocked(lesson.id) ? 'opacity-50 bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-9 h-9 bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center rounded-lg leading-none border border-slate-200/50 shrink-0">
                          {checkIsLessonLocked(lesson.id) ? '🔒' : lesson.week}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">
                            <SpeakableText text={`Week ${lesson.week}: ${lesson.title}`} />
                          </h4>"""

render_replacement = """                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer selection:bg-transparent ${checkIsLessonLocked(lesson.id) ? 'opacity-50 bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-9 h-9 bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center rounded-lg leading-none border border-slate-200/50 shrink-0">
                          {checkIsLessonLocked(lesson.id) ? '🔒' : lesson.week}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 text-sm">
                              <SpeakableText text={`Week ${lesson.week}: ${lesson.title}`} />
                            </h4>
                            {isTeacherPreparation && (
                              <div className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                {getLessonStatus(lesson.id) === 'teacher_unlocked' && <span className="text-sky-600 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-full">🔵 Available to Prepare</span>}
                                {getLessonStatus(lesson.id) === 'pending_approval' && <span className="text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">🟡 Pending Admin Approval</span>}
                                {getLessonStatus(lesson.id) === 'unlocked_for_students' && <span className="text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">🟢 Active for Class</span>}
                                {getLessonStatus(lesson.id) === 'locked' && <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">⚪ Locked</span>}
                              </div>
                            )}
                          </div>"""
content = content.replace(render_target, render_replacement)

# 4. Update the complete action to dispatch 'pending_approval' and pass teacherId
action_target_1 = """                        if (isTeacherPreparation && schoolId) {
                           await updateLessonStatus(schoolId, fullscreenLesson.id, 'teacher_prepared');
                           if (setLessonStatuses) {
                             setLessonStatuses(prev => ({ ...prev, [fullscreenLesson.id]: 'teacher_prepared' }));
                           }
                        }"""
action_replacement_1 = """                        if (isTeacherPreparation && schoolId) {
                           await updateLessonStatus(schoolId, grade, fullscreenLesson.id, 'pending_approval', teacherId);
                           if (setLessonStatuses) {
                             setLessonStatuses(prev => ({ ...prev, [fullscreenLesson.id]: 'pending_approval' }));
                           }
                        }"""
content = content.replace(action_target_1, action_replacement_1)

action_target_2 = """                                    if (isTeacherPreparation && schoolId) {
                                       await updateLessonStatus(schoolId, lesson.id, 'teacher_prepared');
                                       if (setLessonStatuses) {
                                         setLessonStatuses(prev => ({ ...prev, [lesson.id]: 'teacher_prepared' }));
                                       }
                                    }"""
action_replacement_2 = """                                    if (isTeacherPreparation && schoolId) {
                                       await updateLessonStatus(schoolId, grade, lesson.id, 'pending_approval', teacherId);
                                       if (setLessonStatuses) {
                                         setLessonStatuses(prev => ({ ...prev, [lesson.id]: 'pending_approval' }));
                                       }
                                    }"""
content = content.replace(action_target_2, action_replacement_2)

# It replaces two instances of action_target_2 because it's for both immersive unlock modes

with open('/app/applet/src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
print("Updated Dashboard locking and badges")
