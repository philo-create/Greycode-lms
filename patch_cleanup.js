const fs = require('fs');
const file = 'src/app/dashboard/teacher/student/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetEffect = `  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('caps_defined_activities_v2');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setActivities(parsed);
          if (student?.grade) {
            const filtered = parsed.filter((a: any) => a.grade === student.grade);
            if (filtered.length > 0) {
              setSelectedActivityId(filtered[0].id);
            }
          }
        } catch (e) {
          console.error('Error parsing activities:', e);
        }
      }
      setActivitiesLoaded(true);
    }
  }, [student?.grade]);`;

const newEffect = `  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('caps_defined_activities_v2');
      let currentActivities = [];
      if (stored) {
        try {
          currentActivities = JSON.parse(stored);
          setActivities(currentActivities);
          if (student?.grade) {
            const filtered = currentActivities.filter((a: any) => a.grade === student.grade);
            if (filtered.length > 0) {
              setSelectedActivityId(filtered[0].id);
            }
          }
        } catch (e) {
          console.error('Error parsing activities:', e);
        }
      }
      setActivitiesLoaded(true);
      
      // Auto-cleanup orphaned marks from the database if they were deleted from activities
      if (student && student.progress && student.progress.subjectGrades) {
        let changed = false;
        const validActivityIds = new Set(currentActivities.map((a: any) => a.id));
        const newSubjectGrades = { ...student.progress.subjectGrades };
        
        for (const subject in newSubjectGrades) {
          const list = newSubjectGrades[subject] || [];
          const filtered = list.filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
          if (filtered.length !== list.length) {
            newSubjectGrades[subject] = filtered;
            changed = true;
          }
        }
        
        if (changed) {
          const newProgress = { ...student.progress, subjectGrades: newSubjectGrades };
          saveStudentProgress(student.id, newProgress).then(() => {
             console.log('Cleaned up orphaned marks from database');
          });
          // Note: local student state will be updated by the memo, or we can let it be
        }
      }
    }
  }, [student?.grade, student?.id]); // Note: intentionally omitting student.progress to avoid loops, this just runs on mount/grade change`;

if (content.includes(targetEffect)) {
  content = content.replace(targetEffect, newEffect);
  fs.writeFileSync(file, content);
  console.log('Cleanup logic patched');
} else {
  console.log('Target effect not found');
}
