const fs = require('fs');
const file = 'src/app/api/dashboard/parent/route.ts';
let code = fs.readFileSync(file, 'utf8');

// Add school_id to children push
code = code.replace(
  'grade: student.grade,',
  'grade: student.grade,\n            school_id: student.school_id,'
);

// Remove studentProfiles from assignments
const targetString = `      // Also get school_id from raw studentProfiles if available
      if (childSchoolIds.length === 0 && studentProfiles) {
        studentProfiles.forEach(s => {
          if (s.school_id) childSchoolIds.push(s.school_id);
        });
      }`;

code = code.replace(targetString, '');

fs.writeFileSync(file, code);
