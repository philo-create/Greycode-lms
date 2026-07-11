const fs = require('fs');
const file = 'src/app/api/dashboard/parent/route.ts';
let code = fs.readFileSync(file, 'utf8');

const targetString = `      if (childGrades.length > 0 && parentProfile?.school_id) {
        const { data: assignmentsData, error: aError } = await supabase
          .from('assignments')
          .select('*')
          .eq('school_id', parentProfile.school_id)
          .in('grade', childGrades)
          .order('due_date', { ascending: true });`;

const replaceString = `      const childSchoolIds = [...new Set(children.map(c => c.school_id || (c.classes && c.classes.school_id)).filter(Boolean))];
      
      // Also get school_id from raw studentProfiles if available
      if (childSchoolIds.length === 0 && studentProfiles) {
        studentProfiles.forEach(s => {
          if (s.school_id) childSchoolIds.push(s.school_id);
        });
      }
      
      const uniqueSchoolIds = [...new Set(childSchoolIds)];
      const targetSchoolId = parentProfile?.school_id || (uniqueSchoolIds.length > 0 ? uniqueSchoolIds[0] : null);

      if (childGrades.length > 0 && targetSchoolId) {
        const { data: assignmentsData, error: aError } = await supabase
          .from('assignments')
          .select('*')
          .eq('school_id', targetSchoolId)
          .in('grade', childGrades)
          .order('due_date', { ascending: true });`;

code = code.replace(targetString, replaceString);

// We also need to make sure studentProfiles has school_id in its select
code = code.replace(
  ".select('id, full_name, first_name, last_name, grade, progress')",
  ".select('id, full_name, first_name, last_name, grade, progress, school_id')"
);

fs.writeFileSync(file, code);
