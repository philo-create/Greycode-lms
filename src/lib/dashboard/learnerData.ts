import { supabase } from '../supabase';

export async function getLearnerData(userId: string) {
  if (!userId) throw new Error('No user ID provided');

  if (!supabase) {
    return {
      learner: { id: 'demo-learner', full_name: 'Demo Student' },
      stats: {
        points: 150,
        completedLessons: 4,
        badgesCount: 2,
        currentProgress: 65
      },
      recentBadges: [],
      upcomingActivities: [], // Placeholder
      continueLesson: null // Placeholder for next lesson
    };
  }

  // First get learner profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  // Get class mapping
  const { data: scData } = await supabase
    .from('students_classes')
    .select('classes(grade, class_name)')
    .eq('student_id', userId)
    .maybeSingle();

  const learner = {
    ...profile,
    classes: scData?.classes || (profile.grade ? { grade: profile.grade, class_name: `Grade ${profile.grade}` } : null)
  };

  // Get progress
  const { data: progress } = await supabase
    .from('progress')
    .select('*')
    .eq('student_id', userId);

  const totalPoints = (profile.progress as any)?.totalStars || progress?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
  const completedLessons = progress?.filter(p => p.status === 'completed').length || Object.keys((profile.progress as any)?.completedWeeks || {}).length || 0;
  const currentProgress = Math.min(100, Math.round((completedLessons / 10) * 100));

  
  // Get assignments
  let assignments = [];
  const targetGrade = profile.grade || scData?.classes?.grade;
  const targetSchool = profile.school_id || scData?.classes?.school_id;
  
  if (targetGrade) {
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
      // Automatically remove assignments that are past due
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to start of today
      assignments = assignmentsData.filter((a: any) => {
        const dueDate = new Date(a.due_date);
        return dueDate >= now;
      });
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

}
