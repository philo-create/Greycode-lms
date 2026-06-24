import { supabase } from '../supabase';

export async function getTeacherData(teacherId: string) {
  if (!teacherId) throw new Error('No teacher ID provided');

  // Get classes assigned to this teacher
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId);
    
  const classIds = classes?.map(c => c.id) || [];

  let learnersCount = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from('learners')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds);
    learnersCount = count || 0;
  }

  // Get today's lessons (mock logic based on schedule, placeholder for now)
  const todaysLessons = classes ? classes.slice(0, 2) : [];

  return {
    stats: {
      classes: classes?.length || 0,
      learners: learnersCount,
      capsAlignment: 82, // Placeholder
      averageCompletion: 68, // Placeholder
    },
    classes: classes || [],
    todaysLessons,
    recentResults: [] // Placeholder for recent quiz results
  };
}
