const fs = require('fs');
const file = 'src/app/dashboard/teacher/student/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `  // Real class comparison
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
    });`;

const replace1 = `  // Real class comparison
  const validActivityIds = new Set(activities.map(a => a.id));

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
      const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
      if (peerList.length > 0) {
        const peerAvg = Math.round(peerList.reduce((sum, item) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
        totalPeerMarks += peerAvg;
        peerCount++;
      }
    });`;

if(content.includes(target1)) {
    content = content.replace(target1, replace1);
    console.log("Patched target 1");
} else {
    console.log("Target 1 not found!");
}

const target2 = `  let peerAverages: { id: string, avg: number }[] = [];
  let studentActualAvg = studentOverallAvgFromComparison;
  
  classPeers.forEach(peer => {
     let totalSubjectAverages = 0;
     let subjectCount = 0;
     const peerProg = normalizeUserProgress(peer.progress || {});
     const peerSubjectGrades = peerProg?.subjectGrades || {};
     
     subjects.forEach(s => {
       const peerList = peerSubjectGrades[s] || [];
       if (peerList.length > 0) {
          const peerAvg = Math.round(peerList.reduce((sum: number, item: any) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
          totalSubjectAverages += peerAvg;
          subjectCount++;
       }
     });`;

const replace2 = `  let peerAverages: { id: string, avg: number }[] = [];
  let studentActualAvg = studentOverallAvgFromComparison;
  
  classPeers.forEach(peer => {
     let totalSubjectAverages = 0;
     let subjectCount = 0;
     const peerProg = normalizeUserProgress(peer.progress || {});
     const peerSubjectGrades = peerProg?.subjectGrades || {};
     
     subjects.forEach(s => {
       const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
       if (peerList.length > 0) {
          const peerAvg = Math.round(peerList.reduce((sum: number, item: any) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
          totalSubjectAverages += peerAvg;
          subjectCount++;
       }
     });`;

if(content.includes(target2)) {
    content = content.replace(target2, replace2);
    console.log("Patched target 2");
} else {
    console.log("Target 2 not found!");
}

fs.writeFileSync(file, content);
