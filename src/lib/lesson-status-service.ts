import { supabase } from './supabase';
import { LessonStatus } from '@/types';

export async function fetchLessonStatuses(schoolId: string, grade?: string): Promise<Record<string, LessonStatus>> {
  try {
    const url = new URL('/api/lesson-status', window.location.origin);
    url.searchParams.append('schoolId', schoolId);
    if (grade) {
      url.searchParams.append('grade', grade);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch statuses: ${response.statusText}`);
    }

    const data = await response.json();
    return data.statuses || {};
  } catch (err) {
    console.warn("Error fetching lesson statuses via API:", err);
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
