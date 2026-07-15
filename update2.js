const fs = require('fs');

function update(file) {
    let code = fs.readFileSync(file, 'utf8');

    // Add classPeers state if not there
    if (!code.includes('const [classPeers, setClassPeers] = useState<any[]>([])')) {
        code = code.replace(/const \[assignments, setAssignments\] = useState<any\[\]>\(\[\]\);/, 'const [assignments, setAssignments] = useState<any[]>([]);\n  const [classPeers, setClassPeers] = useState<any[]>([]);');
    }

    // Update query
    if (code.includes("select('classes(grade, school_id)')")) {
        code = code.replace(/select\('classes\(grade, school_id\)'\)/g, "select('class_id, classes(grade, school_id)')");
    }

    if (!code.includes("if (scData?.class_id) {")) {
        code = code.replace(/const targetGrade = profile\?\.grade \|\| scData\?\.classes\?\.grade;/, 
        `if (scData?.class_id) {
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
        const targetGrade = profile?.grade || scData?.classes?.grade;`);
    }

    // Update the block from "// Simulate class comparison" up to "return ("
    const classComparisonLogic = `
  // Real class comparison
  const classComparisonData = subjects.map(s => {
    const stats = getSubjectStats(s);
    let studentAvg = stats.count > 0 ? stats.avg : 0;
    
    if (s === 'Coding and Robotics' && studentAvg === 0 && progressData.length > 0) {
        studentAvg = Math.round(progressData.reduce((acc, curr) => acc + (curr.percent || curr.score || 0), 0) / progressData.length);
    }
    
    if (studentAvg === 0) return null;
    
    let totalPeerMarks = 0;
    let peerCount = 0;
    
    classPeers.forEach(peer => {
      if (peer.id === student?.id) return;
      const peerProg = normalizeUserProgress(peer.progress || {});
      const peerSubjectGrades = peerProg?.subjectGrades || {};
      const peerList = peerSubjectGrades[s] || [];
      if (peerList.length > 0) {
        const peerAvg = Math.round(peerList.reduce((sum, item) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
        totalPeerMarks += peerAvg;
        peerCount++;
      }
    });
    
    let classAvg = studentAvg;
    if (peerCount > 0) {
      classAvg = Math.round((totalPeerMarks + studentAvg) / (peerCount + 1));
    }
    
    return {
      subject: s,
      Student: studentAvg,
      Class: classAvg
    };
  }).filter(Boolean);

  const studentOverallAvgFromComparison = classComparisonData.length > 0 
    ? Math.round(classComparisonData.reduce((sum, d) => sum + d.Student, 0) / classComparisonData.length)
    : 0;

  let totalStudents = Math.max(1, classPeers.length);
  
  let peerAverages = [];
  classPeers.forEach(peer => {
     let totalSubjectAverages = 0;
     let subjectCount = 0;
     const peerProg = normalizeUserProgress(peer.progress || {});
     const peerSubjectGrades = peerProg?.subjectGrades || {};
     
     subjects.forEach(s => {
       const peerList = peerSubjectGrades[s] || [];
       if (peerList.length > 0) {
          const peerAvg = Math.round(peerList.reduce((sum, item) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
          totalSubjectAverages += peerAvg;
          subjectCount++;
       }
     });
     
     if (subjectCount > 0) {
       peerAverages.push(Math.round(totalSubjectAverages / subjectCount));
     } else {
       peerAverages.push(0);
     }
  });
  
  let simulatedRankNumber = 1;
  peerAverages.forEach(avg => {
     if (avg > studentOverallAvgFromComparison) {
         simulatedRankNumber++;
     }
  });

  const classOverallAvg = peerAverages.length > 0
    ? Math.round(peerAverages.reduce((sum, avg) => sum + avg, 0) / peerAverages.length)
    : studentOverallAvgFromComparison;

  const simulatedTotalStudents = totalStudents;
  `;

    code = code.replace(/\/\/ Simulate class comparison[\s\S]*?return \(\s*<DashboardLayout/m, classComparisonLogic + '\n  return (\n    <DashboardLayout');
    
    // Also, update the UI to change "Est. Class Rank" to "Class Rank"
    code = code.replace(/Est\. Class Rank/g, 'Class Rank');

    fs.writeFileSync(file, code);
}

update('src/app/dashboard/parent/student/[id]/page.tsx');
update('src/app/dashboard/teacher/student/[id]/page.tsx');

