const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', 'utf8');

const target = `        if (scData?.class_id) {
          const { data: classMembers } = await supabase
            .from('students_classes')
            .select('student_id')
            .eq('class_id', scData.class_id);
          
          if (classMembers && classMembers.length > 0) {
            const studentIds = classMembers.map((m: any) => m.student_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, progress')
              .in('id', studentIds);
            if (profiles) setClassPeers(profiles);
          }
        }`;

const replacement = `        if (scData?.class_id) {
          const { data: classMembers } = await supabase
            .from('students_classes')
            .select('student_id')
            .eq('class_id', scData.class_id);
          
          if (classMembers && classMembers.length > 0) {
            const studentIds = classMembers.map((m: any) => m.student_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, progress')
              .in('id', studentIds);
            // using grade peers below instead
          }
        }
        
        if (profile?.grade) {
          const { data: gradePeers } = await supabase
            .from('profiles')
            .select('id, progress')
            .eq('role', 'student')
            .eq('grade', profile.grade);
          if (gradePeers) {
            setClassPeers(gradePeers);
          }
        }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', content);
  console.log('Teacher done');
} else {
  console.log('Target not found in Teacher');
}
