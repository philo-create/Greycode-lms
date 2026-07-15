export const localStore = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};

export function getStudentWorkbookStates(studentId: string): Record<string, any> {
  const states: Record<string, any> = {};
  if (typeof window === 'undefined') return states;
  const prefix = `_${studentId}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes(prefix) || key.endsWith(`_${studentId}`))) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        states[key] = value;
      }
    }
  }
  return states;
}

export function restoreStudentWorkbookStates(studentId: string, states: Record<string, any>) {
  if (typeof window === 'undefined' || !states) return;
  Object.entries(states).forEach(([key, value]) => {
    // Safety check: only restore keys related to this student
    const prefix = `_${studentId}_`;
    if (key.includes(prefix) || key.endsWith(`_${studentId}`)) {
      localStorage.setItem(key, value as string);
    }
  });
}

export function migrateLocalStorageProgress(targetStudentId: string) {
  if (typeof window === 'undefined' || !targetStudentId) return;
  
  // 1. Migrate detailed workbook state keys from 'default' to target student ID
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('_default_') || key.endsWith('_default'))) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        const newKey = key.replace('_default_', `_${targetStudentId}_`).replace('_default', `_${targetStudentId}`);
        localStorage.setItem(newKey, value);
      }
    }
  }
}

export function mergeProgress(localProgress: any, dbProgress: any) {
  const merged = {
    ...dbProgress,
    ...localProgress,
    completedWeeks: { ...(localProgress?.completedWeeks || {}), ...(dbProgress?.completedWeeks || {}) },
    starsEarned: { ...(localProgress?.starsEarned || {}), ...(dbProgress?.starsEarned || {}) },
    marksPossible: { ...(localProgress?.marksPossible || {}), ...(dbProgress?.marksPossible || {}) },
    workbookStates: { ...(localProgress?.workbookStates || {}), ...(dbProgress?.workbookStates || {}) }
  };
  
  // Merge subjectGrades array list to avoid losing marks
  const mergedSubjectGrades = { ...(dbProgress?.subjectGrades || {}), ...(localProgress?.subjectGrades || {}) };
  Object.keys(mergedSubjectGrades).forEach((subject) => {
    const dbList = dbProgress?.subjectGrades?.[subject] || [];
    const localList = localProgress?.subjectGrades?.[subject] || [];
    const map = new Map();
    dbList.forEach((g: any) => { if (g && (g.id || g.activityId)) map.set(g.id || g.activityId, g); });
    localList.forEach((g: any) => { if (g && (g.id || g.activityId)) map.set(g.id || g.activityId, g); });
    mergedSubjectGrades[subject] = Array.from(map.values());
  });
  merged.subjectGrades = mergedSubjectGrades;

  // Merge attendance
  merged.attendance = { ...(dbProgress?.attendance || {}), ...(localProgress?.attendance || {}) };

  merged.totalStars = Object.values(merged.starsEarned).reduce((sum: number, current: any) => sum + (Number(current) || 0), 0);
  return merged;
}

