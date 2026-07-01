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
      safeCount(supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('role', ['learner', 'student'])),
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

    return {
      school: schoolDetails,
      stats: {
        learners: learnersCount,
        teachers: teachersCount,
        classes: classesCount,
        attendance: 87,
      },
      recentClasses: recentClassesList,
      learnerProgress: 45,
      outstandingAssessments: 12
    };
  } catch (err) {
    console.error('Failed in getSchoolAdminData, returning defaults:', err);
    return defaultData;
  }
}
