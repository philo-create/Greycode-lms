import { supabase } from '../supabase';

export async function getTeacherData(teacherId: string) {
  if (!teacherId) throw new Error('No teacher ID provided');

  if (!supabase) {
    return {
      stats: {
        classes: 0,
        learners: 0,
        capsAlignment: 82, // Placeholder
        averageCompletion: 68, // Placeholder
      },
      classes: [],
      todaysLessons: [],
      recentResults: [] // Placeholder for recent quiz results
    };
  }

  // Get classes assigned to this teacher
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);
    
  const classIds = classes?.map(c => c.id) || [];

  let learnersCount = 0;
  let averageCompletion = 0;
  let averageScore = 0;
  let recentResults: any[] = [];

  if (classIds.length > 0) {
    const { count } = await supabase
      .from('students_classes')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds);
    learnersCount = count || 0;

    const { data: studentClasses } = await supabase
      .from('students_classes')
      .select('student_id')
      .in('class_id', classIds);
      
    const studentIds = studentClasses?.map(sc => sc.student_id) || [];
    
    if (studentIds.length > 0) {
      const { data: progressTableData } = await supabase
        .from('progress')
        .select('status, score, completed_at, module_id, profiles(first_name, last_name)')
        .in('student_id', studentIds);
        
      let progressData: any[] = progressTableData || [];

      if (progressData.length === 0) {
        const { data: studentProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, progress, created_at')
          .in('id', studentIds);

        if (studentProfiles && studentProfiles.length > 0) {
          for (const p of studentProfiles) {
            const pProgress = p.progress as any;
            if (pProgress && typeof pProgress === 'object') {
              const completedWeeks = pProgress.completedWeeks || {};
              const starsEarned = pProgress.starsEarned || {};
              for (const key of Object.keys(completedWeeks)) {
                if (completedWeeks[key]) {
                  progressData.push({
                    student_id: p.id,
                    status: 'completed',
                    score: starsEarned[key] || 3,
                    completed_at: p.created_at || new Date().toISOString(),
                    module_id: key,
                    profiles: {
                      first_name: p.first_name,
                      last_name: p.last_name
                    }
                  });
                }
              }
            }
          }
        }
      }
        
      if (progressData && progressData.length > 0) {
        const completedCount = progressData.filter(p => p.status === 'completed').length;
        // Total expected is student base * 10 expected lessons
        const totalExpected = studentIds.length * 10;
        averageCompletion = Math.min(100, Math.round((completedCount / totalExpected) * 100));
        
        const totalScore = progressData.reduce((sum, p) => sum + (p.score || 0), 0);
        averageScore = Math.round(totalScore / progressData.length);

        recentResults = progressData
          .filter(p => p.status === 'completed' && p.completed_at)
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
          .slice(0, 5)
          .map(p => ({
            learner: `${p.profiles?.first_name || 'Unknown'} ${p.profiles?.last_name || ''}`.trim(),
            score: p.score,
            date: p.completed_at
          }));
      }
    }
  }

  // Get today's lessons (mock logic based on schedule, placeholder for now)
  const todaysLessons = classes ? classes.slice(0, 2) : [];

  return {
    stats: {
      classes: classes?.length || 0,
      learners: learnersCount,
      averageScore: averageScore,
      averageCompletion: averageCompletion,
    },
    classes: classes || [],
    todaysLessons,
    recentResults
  };
}
