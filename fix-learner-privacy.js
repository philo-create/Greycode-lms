const fs = require('fs');
let content = fs.readFileSync('src/lib/dashboard/learnerData.ts', 'utf8');

const targetSchoolGrade = `  if (targetGrade) {
    let query = supabase
      .from('assignments')
      .select('*')
      .eq('grade', targetGrade)
      .order('due_date', { ascending: true });
      
    // Try to match school if known, otherwise we'll fetch all for grade and maybe filter or just return
    // since this might be a demo environment
    const { data: assignmentsData } = await query;
    if (assignmentsData) {
      assignments = assignmentsData;
    }
  }`;

const newTargetSchoolGrade = `  if (targetGrade) {
    let query = supabase
      .from('assignments')
      .select('*')
      .eq('grade', targetGrade)
      .order('due_date', { ascending: true });
      
    // STRICT ISOLATION: Ensure students only see assignments for their specific school
    if (targetSchool) {
      query = query.eq('school_id', targetSchool);
    } else {
      // If the student has no school_id (e.g. demo account), only show global/demo assignments
      query = query.is('school_id', null);
    }
      
    const { data: assignmentsData } = await query;
    if (assignmentsData) {
      assignments = assignmentsData;
    }
  }`;

content = content.replace(targetSchoolGrade, newTargetSchoolGrade);
fs.writeFileSync('src/lib/dashboard/learnerData.ts', content);
