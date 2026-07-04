import { supabase } from './supabase';
import { LessonStatus } from '@/types';

export async function fetchLessonStatuses(schoolId: string, grade?: string): Promise<Record<string, LessonStatus>> {
  if (!supabase) return {};
  try {
    let query = supabase
      .from('class_lesson_status')
      .select('lesson_id, status')
      .eq('school_id', schoolId);
      
    if (grade) {
      query = query.eq('grade', grade);
    }
      
    const { data, error } = await query;
      
    if (error) {
      console.warn("Could not fetch class_lesson_status:", error.message);
      return {};
    }
    
    const statuses: Record<string, LessonStatus> = {};
    if (data) {
      data.forEach(item => {
        statuses[item.lesson_id] = item.status as LessonStatus;
      });
    }
    return statuses;
  } catch (err) {
    console.warn("Error fetching lesson statuses:", err);
    return {};
  }
}

export async function updateLessonStatus(schoolId: string, grade: string, lessonId: string, status: LessonStatus, teacherId?: string) {
  if (!supabase) return;
  try {
    const payload: any = {
      school_id: schoolId,
      grade: grade,
      lesson_id: lessonId,
      status: status,
    };
    
    if (status === 'pending_approval') {
      payload.completed_at = new Date().toISOString();
      if (teacherId) payload.teacher_id = teacherId;
    } else if (status === 'unlocked_for_students') {
      payload.approved_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('class_lesson_status')
      .upsert(payload, { onConflict: 'school_id, grade, lesson_id' });
      
    if (error) throw error;
  } catch (err) {
    console.warn("Error updating lesson status:", err);
  }
}
