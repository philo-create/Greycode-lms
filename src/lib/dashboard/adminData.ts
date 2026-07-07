import { supabase } from '../supabase';

export async function getSuperAdminData() {
  const defaultData = {
    stats: {
      schools: 0,
      learners: 0,
      teachers: 0,
      classes: 0,
    },
    recentSchools: [],
    capsProgress: 65, // Placeholder
    practicalAssessments: 42 // Placeholder
  };

  if (!supabase) {
    return defaultData;
  }

  try {
    async function safeCount(query: any) {
      try {
        const { count, error } = await query;
        if (error) {
          console.warn('Database count query error:', error);
          return 0;
        }
        return count || 0;
      } catch (e) {
        console.warn('Database count exception:', e);
        return 0;
      }
    }

    const [
      schoolsCount,
      learnersCount,
      teachersCount,
      classesCount
    ] = await Promise.all([
      safeCount(supabase.from('schools').select('*', { count: 'exact', head: true })),
      safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'learner')),
      safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher')),
      safeCount(supabase.from('classes').select('*', { count: 'exact', head: true }))
    ]);

    let recentSchoolsList: any[] = [];
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.warn('Error fetching recent schools:', error);
      } else if (data) {
        recentSchoolsList = data;
      }
    } catch (e) {
      console.warn('Exception fetching recent schools:', e);
    }

    let capsProgress = 65;
    let practicalAssessments = 42;

    try {
      const { data: progressTableList } = await supabase
        .from('progress')
        .select('status, score');
        
      let progressList: any[] = progressTableList || [];

      if (progressList.length === 0) {
        const { data: studentProfiles } = await supabase
          .from('profiles')
          .select('id, progress')
          .eq('role', 'learner');

        if (studentProfiles && studentProfiles.length > 0) {
          for (const p of studentProfiles) {
            const pProgress = p.progress as any;
            if (pProgress && typeof pProgress === 'object') {
              const completedWeeks = pProgress.completedWeeks || {};
              const starsEarned = pProgress.starsEarned || {};
              for (const key of Object.keys(completedWeeks)) {
                if (completedWeeks[key]) {
                  progressList.push({
                    status: 'completed',
                    score: starsEarned[key] || 3,
                  });
                }
              }
            }
          }
        }
      }

      if (progressList && progressList.length > 0) {
        const completed = progressList.filter(p => p.status === 'completed').length;
        const totalExpected = (learnersCount || 1) * 10;
        capsProgress = Math.min(100, Math.max(10, Math.round((completed / totalExpected) * 100)));
        
        const withScore = progressList.filter(p => p.status === 'completed' && p.score > 0).length;
        practicalAssessments = Math.min(100, Math.max(5, Math.round((withScore / totalExpected) * 100)));
      }
    } catch (e) {
      console.warn('Error computing dynamic admin progress metrics:', e);
    }

    return {
      stats: {
        schools: schoolsCount,
        learners: learnersCount,
        teachers: teachersCount,
        classes: classesCount,
      },
      recentSchools: recentSchoolsList,
      capsProgress,
      practicalAssessments
    };
  } catch (err) {
    console.error('Failed in getSuperAdminData, returning default stats:', err);
    return defaultData;
  }
}
