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
    .select('*, schools(name, location)')
    .eq('facilitator_id', facilitatorId);

  return {
    classes: classes || [],
    stats: {
      schoolsAssigned: new Set(classes?.map(c => c.school_id)).size || 0,
      classesAssigned: classes?.length || 0,
      pendingReports: 3, // Placeholder
      equipmentIssues: 0 // Placeholder
    },
    todaySchedule: classes?.slice(0, 3) || [] // Placeholder logic
  };
}
