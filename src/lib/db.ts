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
  
  if (supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({ progress })
      .eq('id', studentId);
      
    if (error) {
      console.warn('Supabase update failed (might be missing column or RLS), falling back to local storage.', error);
    } else {
      dbSuccess = true;
    }
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    const profiles = await getStudentProfiles();
    const updated = profiles.map(p => p.id === studentId ? { ...p, progress } : p);
    localStore.setItem('caps_student_profiles_v1', JSON.stringify(updated));
  }
}
