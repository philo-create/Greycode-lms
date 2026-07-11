const fs = require('fs');
const file = 'src/app/api/dashboard/parent/route.ts';
let code = fs.readFileSync(file, 'utf8');

// Insert assignments fetch
const targetString = `    return NextResponse.json({
      children,
      recentProgress: childrenProgress,
      overallAttendance,
      upcomingAssessments,`;

const replaceString = `    let assignments = [];
    if (children && children.length > 0) {
      const childGrades = [...new Set(children.map(c => c.grade).filter(Boolean))];
      if (childGrades.length > 0 && parentProfile?.school_id) {
        const { data: assignmentsData, error: aError } = await supabase
          .from('assignments')
          .select('*')
          .eq('school_id', parentProfile.school_id)
          .in('grade', childGrades)
          .order('due_date', { ascending: true });
          
        if (!aError && assignmentsData) {
          assignments = assignmentsData;
        }
      }
    }

    return NextResponse.json({
      children,
      recentProgress: childrenProgress,
      overallAttendance,
      upcomingAssessments,
      assignments,`;

code = code.replace(targetString, replaceString);
fs.writeFileSync(file, code);
