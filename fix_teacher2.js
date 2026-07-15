const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', 'utf8');

// Add classPeers state if missing
if (!code.includes('const [classPeers, setClassPeers] = useState<any[]>([])')) {
  code = code.replace(/const \[deleteMarkConfirmId, setDeleteMarkConfirmId\] = useState<string \| null>\(null\);/, 
    'const [deleteMarkConfirmId, setDeleteMarkConfirmId] = useState<string | null>(null);\n  const [classPeers, setClassPeers] = useState<any[]>([]);');
}

// Add data fetching for classPeers
if (!code.includes("const { data: scData } = await supabase")) {
  const profileFetchLogic = `
        const normalized = normalizeUserProgress(profile.progress || {});
        setStudent({ ...profile, progress: normalized });
`;
  
  const classPeersFetchLogic = `
        const normalized = normalizeUserProgress(profile.progress || {});
        setStudent({ ...profile, progress: normalized });

        const { data: scData } = await supabase
          .from('students_classes')
          .select('class_id')
          .eq('student_id', studentId)
          .maybeSingle();

        if (scData?.class_id) {
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
        }
`;
  code = code.replace(profileFetchLogic, classPeersFetchLogic);
}

fs.writeFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', code);
