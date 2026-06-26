import { supabase } from '../supabase';

export async function getSuperAdminData() {
  if (!supabase) {
    return {
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
  }

  const [
    { count: schoolsCount },
    { count: learnersCount },
    { count: teachersCount },
    { count: classesCount }
  ] = await Promise.all([
    supabase.from('schools').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'learner'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('classes').select('*', { count: 'exact', head: true })
  ]);

  const { data: recentSchools } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    stats: {
      schools: schoolsCount || 0,
      learners: learnersCount || 0,
      teachers: teachersCount || 0,
      classes: classesCount || 0,
    },
    recentSchools: recentSchools || [],
    capsProgress: 65, // Placeholder
    practicalAssessments: 42 // Placeholder
  };
}
