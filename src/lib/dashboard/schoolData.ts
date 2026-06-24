import { supabase } from '../supabase';

export async function getSchoolAdminData(schoolId: string) {
  if (!schoolId) throw new Error('No school assigned');

  const [
    { count: learnersCount },
    { count: teachersCount },
    { count: classesCount },
    { data: schoolDetails }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'learner'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher'),
    supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
    supabase.from('schools').select('*').eq('id', schoolId).single()
  ]);

  const { data: recentClasses } = await supabase
    .from('classes')
    .select('*, profiles(full_name)')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })
    .limit(4);

  return {
    school: schoolDetails,
    stats: {
      learners: learnersCount || 0,
      teachers: teachersCount || 0,
      classes: classesCount || 0,
      attendance: 87, // Placeholder
    },
    recentClasses: recentClasses || [],
    learnerProgress: 45, // Placeholder
    outstandingAssessments: 12 // Placeholder
  };
}
