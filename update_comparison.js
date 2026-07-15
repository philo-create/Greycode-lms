const fs = require('fs');

function updateFile(file, isTeacher) {
  let code = fs.readFileSync(file, 'utf8');

  const stableRandomLogic = `
  // Simulate class comparison
  const classComparisonData = subjects.map(s => {
    const stats = getSubjectStats(s);
    let studentAvg = stats.count > 0 ? stats.avg : 0;
    
    if (s === 'Coding and Robotics' && studentAvg === 0 && progressData.length > 0) {
        studentAvg = Math.round(progressData.reduce((acc, curr) => acc + (curr.percent || curr.score || 0), 0) / progressData.length);
    }
    
    if (studentAvg === 0) return null;
    
    // Stable pseudo-random offset based on subject name length
    const offset = ((s.length * 7) % 20) - 10; 
    const classAvg = Math.min(100, Math.max(0, studentAvg + offset));
    
    return {
      subject: s,
      Student: studentAvg,
      Class: Math.round(classAvg)
    };
  }).filter(Boolean);

  const studentOverallAvgFromComparison = classComparisonData.length > 0 
    ? Math.round(classComparisonData.reduce((sum, d) => sum + d.Student, 0) / classComparisonData.length)
    : 0;
  const classOverallAvg = classComparisonData.length > 0
    ? Math.round(classComparisonData.reduce((sum, d) => sum + d.Class, 0) / classComparisonData.length)
    : 0;
    
  const simulatedTotalStudents = 32;
  let simulatedRankNumber = Math.round(simulatedTotalStudents / 2);
  let simulatedRankCategory = "Average";
  if (studentOverallAvgFromComparison > classOverallAvg) {
    const percentile = Math.min(0.99, (studentOverallAvgFromComparison - classOverallAvg) / 30);
    simulatedRankNumber = Math.max(1, Math.round(simulatedTotalStudents * (1 - percentile - 0.5)));
    simulatedRankCategory = simulatedRankNumber <= 5 ? "Top 15%" : "Above Average";
  } else if (studentOverallAvgFromComparison < classOverallAvg) {
    const percentile = Math.min(0.99, (classOverallAvg - studentOverallAvgFromComparison) / 30);
    simulatedRankNumber = Math.min(simulatedTotalStudents, Math.round(simulatedTotalStudents * (0.5 + percentile)));
    simulatedRankCategory = simulatedRankNumber >= 27 ? "Needs Support" : "Below Average";
  }
`;

  code = code.replace(/\/\/ Simulate class comparison[\s\S]*?\}\)\.filter\(Boolean\);/, stableRandomLogic.trim());

  let summaryHeader = `
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h3 className="font-black text-slate-800 text-sm">Class Average Comparison</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Overall Avg</span>
                    <span className="text-sm font-black text-indigo-700">{studentOverallAvgFromComparison}% <span className="text-xs text-indigo-400 font-medium">vs {classOverallAvg}%</span></span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Est. Class Rank</span>
                    <span className="text-sm font-black text-emerald-700">{simulatedRankNumber} <span className="text-xs text-emerald-500 font-medium">of {simulatedTotalStudents}</span></span>
                  </div>
                </div>
              </div>
`;

  if (isTeacher) {
    // Teacher uses DashboardCard
    summaryHeader = `
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                      <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Overall Avg</span>
                      <span className="text-sm font-black text-indigo-700">{studentOverallAvgFromComparison}% <span className="text-xs text-indigo-400 font-medium">vs {classOverallAvg}%</span></span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex flex-col items-center">
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Est. Class Rank</span>
                      <span className="text-sm font-black text-emerald-700">{simulatedRankNumber} <span className="text-xs text-emerald-500 font-medium">of {simulatedTotalStudents}</span></span>
                    </div>
                  </div>
                </div>
`;
    // Find where the chart is
    code = code.replace(/<DashboardCard title="Class Average Comparison" color="indigo">\s*<div className="h-\[300px\] w-full">/, 
    '<DashboardCard title="Class Average Comparison" color="indigo">\n' + summaryHeader + '                  <div className="h-[300px] w-full">');
  } else {
    // Parent uses direct div
    code = code.replace(/<h3 className="font-black text-slate-800 text-sm mb-4">Class Average Comparison<\/h3>/, summaryHeader);
  }

  fs.writeFileSync(file, code);
}

updateFile('src/app/dashboard/parent/student/[id]/page.tsx', false);
updateFile('src/app/dashboard/teacher/student/[id]/page.tsx', true);
