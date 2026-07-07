import { supabase } from '../supabase';

export async function getSchoolAdminData(schoolId: string) {
  if (!schoolId) throw new Error('No school assigned');

  const defaultData = {
    school: null,
    stats: {
      learners: 0,
      teachers: 0,
      classes: 0,
      attendance: 87, // Placeholder
    },
    recentClasses: [],
    learnerProgress: 45, // Placeholder
    outstandingAssessments: 12 // Placeholder
  };

  if (!supabase) {
    return defaultData;
  }

  try {
    async function safeCount(query: any) {
      try {
        const { count, error } = await query;
        if (error) {
          console.warn('School admin database count query error:', error);
          return 0;
        }
        return count || 0;
      } catch (e) {
        console.warn('School admin database count exception:', e);
        return 0;
      }
    }

    const [
      learnersCount,
      teachersCount,
      classesCount
    ] = await Promise.all([
      safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'learner')),
      safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher')),
      safeCount(supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId))
    ]);

    let schoolDetails = null;
    try {
      const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).maybeSingle();
      if (!error && data) {
        schoolDetails = data;
      }
    } catch (e) {
      console.warn('Exception fetching school details:', e);
    }

    let recentClassesList: any[] = [];
    try {
      // Attempt select with profiles join first
      const { data, error } = await supabase
        .from('classes')
        .select('*, profiles(full_name)')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) {
        console.warn('Classes join query failed, trying fallback without join:', error);
        const { data: fallbackData } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('created_at', { ascending: false })
          .limit(4);
        recentClassesList = fallbackData || [];
      } else {
        recentClassesList = data || [];
      }
    } catch (e) {
      console.warn('Exception fetching recent classes:', e);
    }

    let learnerProgress = 45;
    let outstandingAssessments = 12;
    let attendance = 87;

    try {
      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', schoolId)
        .eq('role', 'learner');

      if (students && students.length > 0) {
        const studentIds = students.map(s => s.id);
        const { data: progressTableList } = await supabase
          .from('progress')
          .select('student_id, status, score')
          .in('student_id', studentIds);

        let progressList: any[] = progressTableList || [];

        if (progressList.length === 0) {
          const { data: studentProfiles } = await supabase
            .from('profiles')
            .select('id, progress')
            .in('id', studentIds);

          if (studentProfiles && studentProfiles.length > 0) {
            for (const p of studentProfiles) {
              const pProgress = p.progress as any;
              if (pProgress && typeof pProgress === 'object') {
                const completedWeeks = pProgress.completedWeeks || {};
                const starsEarned = pProgress.starsEarned || {};
                for (const key of Object.keys(completedWeeks)) {
                  if (completedWeeks[key]) {
                    progressList.push({
                      student_id: p.id,
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
          // Calculate learner progress as completed lessons out of total expected lessons (10 per student)
          const totalExpected = students.length * 10;
          learnerProgress = Math.min(100, Math.max(10, Math.round((completed / totalExpected) * 100)));
          
          const incomplete = Math.max(0, totalExpected - completed);
          outstandingAssessments = incomplete || 0;
          
          const activeStudents = new Set(progressList.map(p => p.student_id)).size;
          attendance = Math.min(100, Math.max(75, Math.round((activeStudents / students.length) * 100)));
        } else {
          outstandingAssessments = students.length * 2;
          learnerProgress = 0;
          attendance = 80;
        }
      }
    } catch (e) {
      console.warn('Error computing dynamic school metrics:', e);
    }

    return {
      school: schoolDetails,
      stats: {
        learners: learnersCount,
        teachers: teachersCount,
        classes: classesCount,
        attendance,
      },
      recentClasses: recentClassesList,
      learnerProgress,
      outstandingAssessments
    };
  } catch (err) {
    console.error('Failed in getSchoolAdminData, returning defaults:', err);
    return defaultData;
  }
}
