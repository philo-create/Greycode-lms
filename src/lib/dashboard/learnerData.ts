import { supabase } from '../supabase';

export async function getLearnerData(userId: string) {
  if (!userId) throw new Error('No user ID provided');

  // First get learner profile
  const { data: learner } = await supabase
    .from('learners')
    .select('*, classes(grade, class_name)')
    .eq('profile_id', userId)
    .single();

  if (!learner) return null;

  // Get progress
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('learner_id', learner.id);

  // Get badges
  const { data: badges } = await supabase
    .from('learner_badges')
    .select('*, badges(*)')
    .eq('learner_id', learner.id);

  const totalPoints = progress?.reduce((acc, curr) => acc + (curr.points_earned || 0), 0) || 0;
  const completedLessons = progress?.filter(p => p.status === 'completed').length || 0;

  return {
    learner,
    stats: {
      points: totalPoints,
      completedLessons,
      badgesCount: badges?.length || 0,
      currentProgress: 42 // Placeholder percentage
    },
    recentBadges: badges || [],
    upcomingActivities: [], // Placeholder
    continueLesson: null // Placeholder for next lesson
  };
}
