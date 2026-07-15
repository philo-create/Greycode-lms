const fs = require('fs');
const file = 'src/app/dashboard/teacher/student/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `      const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
      if (peerList.length > 0) {
        const peerAvg = Math.round(peerList.reduce((sum, item) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
        totalPeerMarks += peerAvg;
        peerCount++;
      }`;

const replace1 = `      const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
      if (peerList.length > 0) {
        const peerAvg = calculateWeightedAverage(peerList);
        totalPeerMarks += peerAvg;
        peerCount++;
      }`;

if(content.includes(target1)) {
    content = content.replace(target1, replace1);
    console.log("Patched target 1");
} else {
    console.log("Target 1 not found!");
}

const target2 = `       const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
       if (peerList.length > 0) {
          const peerAvg = Math.round(peerList.reduce((sum: number, item: any) => sum + ((item.score / item.outOf) * 100), 0) / peerList.length);
          totalSubjectAverages += peerAvg;
          subjectCount++;
       }`;

const replace2 = `       const peerList = (peerSubjectGrades[s] || []).filter((g: any) => !g.activityId || validActivityIds.has(g.activityId));
       if (peerList.length > 0) {
          const peerAvg = calculateWeightedAverage(peerList);
          totalSubjectAverages += peerAvg;
          subjectCount++;
       }`;

if(content.includes(target2)) {
    content = content.replace(target2, replace2);
    console.log("Patched target 2");
} else {
    console.log("Target 2 not found!");
}

fs.writeFileSync(file, content);
