import { supabase } from '../supabase';

export async function getParentData(parentId: string) {
  if (!parentId) throw new Error('No parent ID provided');

  // Find children linked to this parent
  const { data: children } = await supabase
    .from('learners')
    .select('*, profiles!learners_profile_id_fkey(full_name, email), classes(grade, class_name)')
    .eq('parent_profile_id', parentId);

  // If they have children, fetch their progress
  let childrenProgress: any[] = [];
  if (children && children.length > 0) {
    const childIds = children.map(c => c.id);
    
    // For demo/simplicity, we just get recent progress
    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .in('learner_id', childIds)
      .order('completed_at', { ascending: false })
      .limit(10);
      
    childrenProgress = progress || [];
  }

  return {
    children: children || [],
    recentProgress: childrenProgress,
    overallAttendance: 92, // Placeholder
    upcomingAssessments: 2, // Placeholder
  };
}
