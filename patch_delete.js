const fs = require('fs');
const file = 'src/app/dashboard/teacher/assessments/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  // Delete activity handler
  const handleDeleteActivity = (id: string, name: string) => {
    const updated = activities.filter(a => a.id !== id);
    updateActivitiesList(updated);
    
    if (selectedBulkActivityId === id && updated.length > 0) {
      setSelectedBulkActivityId(updated[0].id);
    }
    if (selectedSingleActivityId === id && updated.length > 0) {
      setSelectedSingleActivityId(updated[0].id);
    }
    
    setSuccessMsg(\`Deleted activity definition for "\${name}".\`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };`;

const newStr = `  // Delete activity handler
  const handleDeleteActivity = async (id: string, name: string) => {
    const updated = activities.filter(a => a.id !== id);
    updateActivitiesList(updated);
    
    if (selectedBulkActivityId === id && updated.length > 0) {
      setSelectedBulkActivityId(updated[0].id);
    }
    if (selectedSingleActivityId === id && updated.length > 0) {
      setSelectedSingleActivityId(updated[0].id);
    }
    
    // Also remove this activity's scores from all students' progress
    try {
      setIsSubmitting(true);
      let anyUpdated = false;
      const updatedStudents = [...students];
      
      for (let i = 0; i < updatedStudents.length; i++) {
        const student = updatedStudents[i];
        if (!student.progress || !student.progress.subjectGrades) continue;
        
        let studentChanged = false;
        const newSubjectGrades = { ...student.progress.subjectGrades };
        
        for (const subject in newSubjectGrades) {
          const list = newSubjectGrades[subject] || [];
          const filtered = list.filter((g: any) => g.activityId !== id && g.name !== name);
          if (filtered.length !== list.length) {
            newSubjectGrades[subject] = filtered;
            studentChanged = true;
          }
        }
        
        if (studentChanged) {
          anyUpdated = true;
          const newProgress = { ...student.progress, subjectGrades: newSubjectGrades };
          updatedStudents[i] = { ...student, progress: newProgress };
          await saveStudentProgress(student.id, newProgress);
        }
      }
      
      if (anyUpdated) {
        setStudents(updatedStudents);
        setSuccessMsg(\`Deleted activity definition for "\${name}" and removed associated scores from learners.\`);
      } else {
        setSuccessMsg(\`Deleted activity definition for "\${name}".\`);
      }
    } catch (err: any) {
      console.error('Failed to remove activity from students:', err);
      setErrorMsg('Activity deleted, but failed to remove scores from some students.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 4000);
    }
  };`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync(file, content);
  console.log('Patched');
} else {
  console.log('Target string not found');
}
