import { supabase } from '../supabase';

export async function getFacilitatorData(facilitatorId: string) {
  if (!facilitatorId) throw new Error('No facilitator ID provided');

  if (!supabase) {
    return {
      classes: [],
      stats: {
        schoolsAssigned: 0,
        classesAssigned: 0,
        pendingReports: 3, // Placeholder
        equipmentIssues: 0 // Placeholder
      },
      todaySchedule: [] // Placeholder logic
    };
  }

  const { data: classes } = await supabase
    .from('classes')
    .select('*, schools:school_id(name, location)')
    .eq('facilitator_id', facilitatorId);

  let pendingReports = 3;
  let equipmentIssues = 0;

  try {
    const { count } = await supabase
      .from('class_lesson_status')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');
      
    if (count !== null) {
      pendingReports = count;
    }
  } catch (e) {
    console.warn('Error fetching facilitator pending reports count:', e);
  }

  return {
    classes: classes || [],
    stats: {
      schoolsAssigned: new Set(classes?.map(c => c.school_id)).size || 0,
      classesAssigned: classes?.length || 0,
      pendingReports,
      equipmentIssues
    },
    todaySchedule: classes?.slice(0, 3) || [] // Placeholder logic
  };
}
