const fs = require('fs');
let content = fs.readFileSync('src/lib/dashboard/learnerData.ts', 'utf8');

const assignmentsCode = `
  // Get assignments
  let assignments = [];
  if (profile.school_id && profile.grade) {
    const { data: assignmentsData } = await supabase
      .from('assignments')
      .select('*')
      .eq('school_id', profile.school_id)
      .eq('grade', profile.grade)
      .order('due_date', { ascending: true });
    
    if (assignmentsData) {
      assignments = assignmentsData;
    }
  }

  return {
    learner,
    stats: {
      points: totalPoints,
      completedLessons,
      badgesCount: 0,
      currentProgress
    },
    recentBadges: [],
    upcomingActivities: [], // Placeholder
    continueLesson: null, // Placeholder for next lesson
    assignments // Add assignments here
  };
`;
// Need to replace the return statement with this
content = content.replace(/return \{\s*learner,\s*stats: \{\s*points: totalPoints,\s*completedLessons,\s*badgesCount: 0,\s*currentProgress\s*\},\s*recentBadges: \[\],\s*upcomingActivities: \[\], \/\/ Placeholder\s*continueLesson: null \/\/ Placeholder for next lesson\s*\};/, assignmentsCode);

fs.writeFileSync('src/lib/dashboard/learnerData.ts', content);
