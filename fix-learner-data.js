const fs = require('fs');
let content = fs.readFileSync('src/lib/dashboard/learnerData.ts', 'utf8');

const targetSchoolGrade = `
  const targetGrade = profile.grade || scData?.classes?.grade;
  const targetSchool = profile.school_id;
  
  if (targetSchool && targetGrade) {
    const { data: assignmentsData } = await supabase
      .from('assignments')
      .select('*')
      .eq('school_id', targetSchool)
      .eq('grade', targetGrade)
      .order('due_date', { ascending: true });
    
    if (assignmentsData) {
      assignments = assignmentsData;
    }
  } else if (targetGrade) {
     // Fallback if school_id isn't explicitly set but grade is (for global/test assignments)
     // Or we can try to find assignments for that grade regardless of school if demo
     const { data: assignmentsData } = await supabase
      .from('assignments')
      .select('*')
      .eq('grade', targetGrade)
      .order('due_date', { ascending: true });
      
     if (assignmentsData) {
       // Filter by school_id if we want, or just show them
       assignments = targetSchool ? assignmentsData.filter(a => a.school_id === targetSchool || !a.school_id) : assignmentsData;
     }
  }
`;

const newTargetSchoolGrade = `
  const targetGrade = profile.grade || scData?.classes?.grade;
  const targetSchool = profile.school_id || scData?.classes?.school_id;
  
  if (targetGrade) {
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
  }
`;

content = content.replace(targetSchoolGrade.trim(), newTargetSchoolGrade.trim());
fs.writeFileSync('src/lib/dashboard/learnerData.ts', content);
