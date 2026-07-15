const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', 'utf8');
const timelineCode = `  const timelineData = Object.entries(subjectGrades)
    .flatMap(([subject, marks]) => (marks as any[]).map(m => ({
      ...m,
      subject,
      percent: Math.round((m.score / m.outOf) * 100),
      dateObj: new Date(m.date)
    })))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    .map(d => ({
      name: d.name,
      date: new Date(d.date).toLocaleDateString(),
      percent: d.percent,
      subject: d.subject
    }));
`;
code = code.replace('  const radarSkillsData = subjects.map(s => {', timelineCode + '\n  const radarSkillsData = subjects.map(s => {');
fs.writeFileSync('src/app/dashboard/teacher/student/[id]/page.tsx', code);
