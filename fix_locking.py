import re

with open('/app/applet/src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

toggle_target = """  const handleToggleWeek = (id: string) => {
    const isExpanding = expandedWeek !== id;
    setExpandedWeek(isExpanding ? id : null);
  };"""
toggle_replacement = """  const checkIsLessonLocked = (lessonId: string) => {
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
  };

  const handleToggleWeek = (id: string) => {
    if (checkIsLessonLocked(id)) {
      alert("This lesson is currently locked and requires admin approval.");
      return;
    }
    const isExpanding = expandedWeek !== id;
    setExpandedWeek(isExpanding ? id : null);
  };"""
content = content.replace(toggle_target, toggle_replacement)

# Also update the render to show a lock icon
render_target = """                      onClick={() => handleToggleWeek(lesson.id)}
                      id={`week-row-${lesson.week}`}
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer selection:bg-transparent"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-9 h-9 bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center rounded-lg leading-none border border-slate-200/50 shrink-0">
                          {lesson.week}
                        </span>"""
render_replacement = """                      onClick={() => handleToggleWeek(lesson.id)}
                      id={`week-row-${lesson.week}`}
                      className={`p-4 flex items-center justify-between gap-4 cursor-pointer selection:bg-transparent ${checkIsLessonLocked(lesson.id) ? 'opacity-50 bg-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-9 h-9 bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center rounded-lg leading-none border border-slate-200/50 shrink-0">
                          {checkIsLessonLocked(lesson.id) ? '🔒' : lesson.week}
                        </span>"""
content = content.replace(render_target, render_replacement)

# And update the completion button to mark as teacher_prepared
btn_target = """                    <button
                      disabled={!isChecklistCompletedForLesson(fullscreenLesson.id)}
                      onClick={() => {
                        const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                        updateProgress(weekKey, 3, 3);
                      }}"""
btn_replacement = """                    <button
                      disabled={!isChecklistCompletedForLesson(fullscreenLesson.id)}
                      onClick={async () => {
                        const weekKey = `${grade}-${fullscreenLesson.term}-${fullscreenLesson.week}`;
                        updateProgress(weekKey, 3, 3);
                        
                        if (isTeacherPreparation && schoolId) {
                           await updateLessonStatus(schoolId, fullscreenLesson.id, 'teacher_prepared');
                           if (setLessonStatuses) {
                             setLessonStatuses(prev => ({ ...prev, [fullscreenLesson.id]: 'teacher_prepared' }));
                           }
                        }
                      }}"""
content = content.replace(btn_target, btn_replacement)

btn_target2 = """                                <button
                                  disabled={!isChecklistCompletedForLesson(lesson.id)}
                                  onClick={() => {
                                    const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                    updateProgress(weekKey, stars, possible);
                                    handleUnlockNextLesson('1-T1-W2');
                                  }}"""
btn_replacement2 = """                                <button
                                  disabled={!isChecklistCompletedForLesson(lesson.id)}
                                  onClick={async () => {
                                    const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                    updateProgress(weekKey, stars, possible);
                                    handleUnlockNextLesson('1-T1-W2');
                                    if (isTeacherPreparation && schoolId) {
                                       await updateLessonStatus(schoolId, lesson.id, 'teacher_prepared');
                                       if (setLessonStatuses) {
                                         setLessonStatuses(prev => ({ ...prev, [lesson.id]: 'teacher_prepared' }));
                                       }
                                    }
                                  }}"""
content = content.replace(btn_target2, btn_replacement2)

btn_target3 = """                                <button
                                  disabled={!isChecklistCompletedForLesson(lesson.id)}
                                  onClick={() => {
                                    const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                    updateProgress(weekKey, stars, possible);
                                    handleUnlockNextLesson(lesson.id);
                                  }}"""
btn_replacement3 = """                                <button
                                  disabled={!isChecklistCompletedForLesson(lesson.id)}
                                  onClick={async () => {
                                    const weekKey = `${grade}-${lesson.term}-${lesson.week}`;
                                    updateProgress(weekKey, stars, possible);
                                    handleUnlockNextLesson(lesson.id);
                                    if (isTeacherPreparation && schoolId) {
                                       await updateLessonStatus(schoolId, lesson.id, 'teacher_prepared');
                                       if (setLessonStatuses) {
                                         setLessonStatuses(prev => ({ ...prev, [lesson.id]: 'teacher_prepared' }));
                                       }
                                    }
                                  }}"""
content = content.replace(btn_target3, btn_replacement3)

with open('/app/applet/src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
print("Updated Dashboard locking")
