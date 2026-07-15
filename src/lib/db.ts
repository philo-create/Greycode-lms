import { localStore } from './localStore';import { supabase } from './supabase';
import { StudentProfile, UserProgress } from '../types';

/**
 * Database interface for the LMS.
 * Once you add your Supabase keys, these functions will connect directly to PostgreSQL.
 */

export async function getStudentProfiles(): Promise<StudentProfile[]> {
  if (supabase) {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data as StudentProfile[];
  }
  
  // Fallback to local storage if Supabase is not configured yet
  if (typeof window !== 'undefined') {
    const local = localStore.getItem('caps_student_profiles_v1');
    if (local) return JSON.parse(local);
  }
  return [];
}

export async function saveStudentProgress(studentId: string, progress: UserProgress): Promise<void> {
  let dbSuccess = false;
  
  // Try to use our server-side API first, which uses service-role to bypass RLS policies
  try {
    const response = await fetch('/api/dashboard/teacher/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, progress })
    });
    
    if (response.ok) {
      dbSuccess = true;
    } else {
      console.warn('Admin API progress save failed, falling back to direct update or local storage');
    }
  } catch (err) {
    console.warn('API route call error, falling back', err);
  }

  // Fallback to direct client-side update if the API call failed
  if (!dbSuccess && supabase) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ progress })
        .eq('id', studentId);
      if (!error) {
        dbSuccess = true;
      }
    } catch (e) {
      console.warn('Direct Supabase update failed', e);
    }
  }

  // Always keep local storage updated as a fallback/cache
  if (typeof window !== 'undefined') {
    const profiles = await getStudentProfiles();
    const updated = profiles.map(p => p.id === studentId ? { ...p, progress } : p);
    localStore.setItem('caps_student_profiles_v1', JSON.stringify(updated));
  }
}
